var PNGReader = require('png.js');
var fs = require('fs');
var path = require('path');
var image=[];
fs.readFile('images/sutd.png', function(err, buffer){

    var reader = new PNGReader(buffer);
    reader.parse(function(err, png){
        if (err) throw err;
        setImage(png);
    });

});

function setImage(raw){
	image = raw
}

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8080});
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received: %s', message);
        var position = message.split(",");
        wss.clients[wss.clients.length - 1].positionx = parseInt(position[0]);
        wss.clients[wss.clients.length - 1].positiony = parseInt(position[1]);
    });
});

var offsetx = 0;
setInterval(function(){
	wss.clients.forEach(function each(client) {
    var xpos = client.positionx + offsetx;
    xpos %= image.width
    client.send(JSON.stringify(image.getPixel(xpos, client.positiony)));
  });
    offsetx += 1
}, 500);


var http = require('http');
http.createServer(function (req, res) {
    if (req.url === '/'){
        fs.readFile('index.html', function(e, c){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(c);
        });
    } else if (req.url === '/simulator'){
        fs.readFile('simulator.html', function(e, c){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(c);
        });
    }else {
        var filePath = '.' + req.url;
        var extname = path.extname(filePath)
        var contentType = 'text/html';
        switch(extname){
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.png':
                contentType = 'image/png';
                break;

        }
        fs.readFile(filePath, function(error, content){
            if (error){
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.end('Page not found.\n');
            } else{
                res.writeHead(200, {'Content-Type': contentType});
                res.end(content);
            }
        });
        
    }
}).listen(3000, '0.0.0.0');


