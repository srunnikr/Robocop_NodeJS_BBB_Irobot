var net = require("net");
var fs = require('fs');
var server1_on = 0;
var server2_on = 0;
var server1_detected = 0;
var server2_detected = 0;
var childProcess = require('child_process');

fs.writeFile('server1_on.txt','0', function (err) {
  if (err) throw err;
});
fs.writeFile('server2_on.txt','0', function (err) {
  if (err) throw err;
});
fs.writeFile('server1_detected.txt','0', function (err) {
  if (err) throw err;
});
fs.writeFile('server2_detected.txt','0', function (err) {
  if (err) throw err;
});

var tcpServer = net.createServer(function (socket) {
		console.log('Connection established! \n ');
		if (socket.remoteAddress == '192.168.43.52'){
			server1_on = 1
			fs.writeFile('server1_on.txt','1', function (err) {
			  if (err) throw err;
			});
			console.log('Connection established to Sensor 1! \n ');
			}
		else if	(socket.remoteAddress == '192.168.1.2'){
			server2_on = 1
                        fs.writeFile('server2_on.txt','1', function (err) {
                          if (err) throw err;
                        });  
			console.log('Connection established to Sensor 2! \n ');
			}

		socket.on('data',function(data){
                	console.log(data.toString());
			if (data.toString()=='Triggered1'){
				server1_detected = 1;
                        	fs.writeFile('server1_detected.txt','1', function (err) {
                          	if (err) throw err;
                        	});  			
			}
			else if (data.toString()=='Triggered2'){
				server2_detected =1;
                                fs.writeFile('server2_detected.txt','1', function (err) {
                                if (err) throw err;
                                });
			}
                        if ( server1_detected == 1){
				socket.write('Sensor 1 Triggered!');
                childProcess.exec('sudo python bot_move.py sensor1', function (error, stdout, stderr) {
                   		 console.log('stdout: ' + stdout);
                   		 console.log('stderr: ' + stderr);
                    		 if (error !== null) {
                        		console.log('exec error: ' + error);
                      		  }
                	     });
		         }
			else if ( server2_detected == 1){
                                socket.write('Sensor 2 Triggered!');
                childProcess.exec('sudo python bot_move.py sensor2', function (error, stdout, stderr) {
                                 console.log('stdout: ' + stdout);
                                 console.log('stderr: ' + stderr);
                                 if (error !== null) {
                                        console.log('exec error: ' + error);
                                  }
                             });
                         } 
		 

		});
	
		socket.on('end', function() {
			console.log('client disconnected');
		});	
});

tcpServer.listen(5001, function() { 
  console.log('Listening!');
});

// HTTP

var http = require('http');
var url = require('url');
var io = require('socket.io');
//var fs = require('fs');
var childProcess = require('child_process');


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

});

server.listen(5000);

var listener = io.listen(server);


listener.sockets.on('connection', function(socket) {
			console.log("test");

			fs.watch('sensor1_on.txt', function(event, filename) {
				if(event == 'change') {
					console.log("Emitting sensor 1 on event");
					socket.emit('updateSensor1On');
				}
			});

			fs.watch('sensor2_on.txt', function(event, filename) {
                                if(event == 'change') {
                                        console.log("Emitting sensor 2 on event");
                                        socket.emit('updateSensor2On');
                                }
                        });

			if (server1_on == 1){
			console.log('HTTP:Connection established to Sensor1! \n ');
				
			}
			if (server2_on == 1){
			console.log('HTTP:Connection established to Sensor2! \n ');
			}
			if(server1_detected == 1){
			console.log("HTTP:Intruder Alert on Sensor1 \n");
			}
			else if(server2_detected == 1){
			console.log("HTTP:Intruder Alert on Sensor 2 \n");
			}	

});


