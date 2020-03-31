/*const http = require('http');
 
const hostname = '127.0.0.1';
const port = 1337;
 
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/
var http = require('http');
var fs = require('fs');

var app = http.createServer(function (request, response) {
    var url = request.url;
    if (request.url == '/') {
        url = '/index.html';
    }

    if (request.url == '/favicon.ico') {
        return response.writeHead(404);
    }
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + url));
});

app.listen(3000);