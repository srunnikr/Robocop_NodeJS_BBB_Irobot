/* This server should be running on server 1,
The events are written for that purpose */

var socket = require('socket.io-client')('http://192.168.43.249:5000');
var fs = require('fs');
var lastDisturbanceTime;

socket.on('connect', function() {
	console.log("Connected to server");
});

socket.on('sensor2DisturbanceDetectedClient', function() {
console.log("Wrong place!");
});

socket.on('connect_error', function(err) {
	console.log("Error occured" + err);
});

socket.on('disconnect', function(){
	console.log("Disconected from server");
});

fs.watchFile('event.txt', function(curr, prev) {
	console.log('the current mtime is: ' + curr.mtime);
	lastDisturbanceTime = curr.mtime;
  	console.log('the previous mtime was: ' + prev.mtime);
  	socket.emit('sensor2DisturbanceDetected');
});
