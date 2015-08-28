var http = require('http');
var fs = require('fs');
var path = require('path');

//this server exists only to serve pages and resources
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
    }else if (req.url === '/admin'){
        fs.readFile('admin.html', function(e, c){
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