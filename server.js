var PNGReader = require('png.js');
var fs = require('fs');
var path = require('path');


//reading of images to dictionary
var images = {};
var tmp = [];
function setTmp(raw){
    tmp.push(raw);
}

var files = ['sutd.png', 'tree.png']
for (var i = 0; i < files.length; i++){
    buffer = fs.readFileSync('images/' + files[i]);
    var reader = new PNGReader(buffer);
    reader.parse(function(err, png){
        if (err) throw err;
        setTmp(png);
    });
}



var maxclients = 0;
var holdingscreenid;
var animationscreenid;
var start = false;

//WebSocket server to tell clients what colour to display
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8080});
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        parts = message.split(':');
        if (parts[0] == ""){
            console.log('received: %s', message);
            console.log('total number of clients: %d', wss.clients.length);
            if (wss.clients.length > maxclients){
                maxclients = wss.clients.length
            }
            console.log('max number of clients this session: %d', maxclients);
            var position = parts[1].split(",");
            //set coordinates of pixels
            wss.clients[wss.clients.length - 1].positionx = parseInt(position[0]);
            wss.clients[wss.clients.length - 1].positiony = parseInt(position[1]);
        } else if (parts[0] == "start"){
            start = true;
            startAnimation();
            console.log('Animation started');
        }
    });

    
});

var sequence = [
    { image:'sutd',
      interval:200,
      dirX:1,//1 move towards left, -1 move towards right
      dirY:0,//1 move down, -1 move up
      offsetx:0, 
      offsety:0, 
      numticks:90
    },
    {
      image:'sutd',
      interval:200,
      dirX:0,//1 move towards left, -1 move towards right
      dirY:1,//1 move down, -1 move up
      offsetx:0, 
      offsety:0, 
      numticks:30
    }
];

function startHoldingScreen(){
    console.log('Showing holding screen');
    //first screen
    holdingscreenid = setInterval(function(){
        if(start == true){
            clearInterval(holdingscreenid);
        }else{
            wss.clients.forEach(function each(client) {
                client.send(JSON.stringify(images['sutd'].getPixel(client.positionx, client.positiony)));
            });
        }
    }, 500);
}
function startAnimation(){
    var i = 0;
    var current = sequence[i];
    var offsetx = current.offsetx;
    var offsety = current.offsety;
    var ticks = 0;
    animationscreenid = setInterval(function(){
        if(ticks == current.numticks){
            console.log('Finished animation ' + i);
            i += 1;
            ticks = 0;
            if (i == sequence.length){
                clearInterval(animationscreenid);
                start = false;
                startHoldingScreen();
                console.log('Animation finished');
            } else{
                current = sequence[i];
            }
        }else{
            wss.clients.forEach(function each(client) {
                var xpos = client.positionx + offsetx;
                xpos = xpos % images[current.image].width
                var ypos = client.positiony + offsety;
                ypos %= images[current.image].height
                client.send(JSON.stringify(images[current.image].getPixel(xpos, ypos)));
            });
            offsetx += current.dirX;
            offsety += current.dirY;
            ticks += 1;
        }
    }, current.interval);
    
}

// to make sure the files have finished loading
setTimeout(function(){
    images['sutd'] = tmp[0]
    images['tree'] = tmp[1]
    
    startHoldingScreen();    

}, 500);





