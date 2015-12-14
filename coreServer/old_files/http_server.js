var http = require('http');
var url = require('url');
var io = require('socket.io');
var fs = require('fs');
var childProcess = require('child_process');
var tcpsock = require('net');

var server = http.createServer( function (request, response) {

	var path = url.parse(request.url).pathname;

	switch(path) {

		case '/':
			console.log("Request for homepage received");
			fs.readFile('index.html', function(error, data) {
				if (error) {
					console.log("Inside the homepage error handler");
					response.writeHead(404);
					response.write("Oops the page does`nt exist");
					response.end();
				} else {
					response.writeHead(200, {'Content-Type':'text/html'});
					response.write(data);
					response.end();
				}
			});
			break;

		default:
			response.writeHead(404);
			response.writeHead("Oops resource not found!");
			response.end();
			break;
	}

	server.on('Sensor1', function(){
	console.log('working'); });
		
});

server.listen(5000);

var listener = io.listen(server);

listener.sockets.on('connection', function(socket) {

	var tcpClient = new tcpsock.Socket();
	tcpClient.setEncoding("ascii");
	tcpClient.setKeepAlive(true);
	
	tcpClient.connect(5000,function() {
	console.info('CONNECTED TO : 5000');

        tcpClient.on('data', function(data) {
            console.log('DATA: ' + data);
            socket.emit("httpServer", data);
        });
		
   });	 

});

