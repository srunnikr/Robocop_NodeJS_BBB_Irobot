var http = require('http');
var io = require('socket.io');
var url = require('url');
var fs = require('fs');
var childProcess = require('child_process');

var sensor1Status = "OK";
var sensor2Status = "OK";

var server = http.createServer( function(request, response) {
	var path = url.parse(request.url).pathname;
	switch(path) {
		case '/':
			console.log("Request for homepage recieved");
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
		case '/image':
			console.log("Request for image received");
			var imageStream = fs.createReadStream('bbimage.jpg');
			response.pipe(imageStream);
			imageStream.on('end', function() {
				console.log("Stream read complete");
			});
			break;
		case '/help':
			console.log("Request for homepage recieved");
			fs.readFile('help.html', function(error, data) {
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
		case '/about':
			console.log("Request for about page received");
			fs.readFile('about.html', function(error, data) {
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
			console.log("Request for non present request recieved");
			response.writeHead(404);
			response.write("Resource not found");
			response.end();
			break;
	}
});

server.listen(5000);

var listener = io.listen(server);

listener.sockets.on('connection', function(socket) {

	console.log("A new host connected");

	socket.on('needImage', function() {
		console.log("Received image request");
		
		childProcess.exec('sudo python get_pic.py', function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });
		setTimeout( function() {
			socket.emit('imageUrl', {'imageUrl':'192.168.43.249:1500/image'});
		},4000);
	});

	// Events to update sensor status
	socket.on('sensorStatusQuery', function() {
		socket.emit('sensorStatusQueryResponse', {'sensor1':sensor1Status, 'sensor2':sensor2Status});
		//socket.emit('sensor1DisturbanceDetectedClient');
	});

	// Remote driving event handlers
	socket.on('remoteDriveFwd', function() {
		console.log("Request for remote drive forward received");
		//socket.emit('sensor1DisturbanceDetectedClient');
		childProcess.exec('sudo python remote_drive.py 1', function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		    	console.log('exec error: ' + error);
		    }
		});
	});
	socket.on('remoteDriveBack', function() {
		console.log("Request for remote drive backward received");
		childProcess.exec('sudo python remote_drive.py 2', function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		    	console.log('exec error: ' + error);
		    }
		});
	});
	socket.on('remoteDriveLeft', function() {
		console.log("Request for remote drive left received");
		childProcess.exec('sudo python remote_drive.py 3', function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		    	console.log('exec error: ' + error);
		    }
		});
	});
	socket.on('remoteDriveRight', function() {
		console.log("Request for remote drive right received");
		childProcess.exec('sudo python remote_drive.py 4', function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		    	console.log('exec error: ' + error);
		    }
		});
	});

	// Event to handle sensor timeout and errors - set variables accordingly and send client events to update sensors

	// Event to handle sensor disturbance event
	// Call the image script from teh move bot script itself to remove the timing constraints
	socket.on('sensor1DisturbanceDetected', function() {
		console.log("Sensor 1 disturbance detected");
		// execute python script to drive to sensor 1 location and take picture, email
		childProcess.exec('sudo python bot_move.py sensor1', function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		    	console.log('exec error: ' + error);
		    }
		});
		console.log("Sending sensor1 disturbance detected event to client");
		socket.broadcast.emit('sensor1DisturbanceDetectedClient');
		setTimeout(function() {
			socket.broadcast.emit('imageUrl', {'imageUrl':'http://192.168.43.249:1500/image'});
		}, 15000);
	});
	socket.on('sensor2DisturbanceDetected', function() {
		console.log("Sensor 2 disturbance detected");
		// execute python script to drive to sensor 1 location and take picture, email
		childProcess.exec('sudo python bot_move.py sensor2', function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		    	console.log('exec error: ' + error);
		    }
		});
		console.log("Sending sensor2 disturbance detected event to client");
		socket.broadcast.emit('sensor2DisturbanceDetectedClient');
		setTimeout(function() {	
			socket.broadcast.emit('imageUrl', {'imageUrl':'http://192.168.43.249:1500/image'});
		}, 8000);
	});

});
