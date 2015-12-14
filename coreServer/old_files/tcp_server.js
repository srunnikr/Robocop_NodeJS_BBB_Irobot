var net = require("net");
var server1_on = 0;
var server2_on = 0;
var childProcess = require('child_process');

var tcpServer = net.createServer(function (socket) {
		console.log('Connection established! \n ');
		if (socket.remoteAddress == '192.168.43.52'){
			server1_on = 1
			console.log('Connection established to server1! \n ');
			}
		else if	(socket.remoteAddress == '192.168.1.2'){
			server2_on = 1
			console.log('Connection established to server2! \n ');
			}

		socket.on('data',function(data){
                	console.log(data.toString());
			if ( server1_on == 1){
			     socket.write('Sensor 1 Triggered!');
			     console.log('test');
                	     childProcess.exec('sudo python bot_move.py sensor1', function (error, stdout, stderr) {
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

var PORT = 5000;

var server = net.createServer();
server.listen(PORT);

server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
	sock.write("TCP sending message : 1");
    console.log('Server listening on ' + server.address().address +':'+ 
        server.address().port);
}).listen(PORT);
