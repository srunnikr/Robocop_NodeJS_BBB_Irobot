var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var express = require('express');
var path = require('path');

server.listen(1500);

app.use(express.static(__dirname + '/public'));

app.get('/image', function (req, res) {
	res.sendFile(path.join(__dirname,'bbimage.jpg'));
});

