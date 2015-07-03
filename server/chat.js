//imports 
var express = require('express');
var io = require('socket.io');

//variables
var cliPort = process.env.OPENSHIFT_NODEJS_PORT || 80;
var srvPort = process.argv[2];
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

//Sets up a server and listens for webSocket connections on the designated port
var serverApp = express();
var server =  serverApp.listen(srvPort, server_ip_address);
io = io(server);

//Sets up a server that serves static files from designated path
var clientApp = express();
clientApp.use(express.static('node_modules/anon-chat/app/'));
var client =  clientApp.listen(cliPort, server_ip_address);

//When a connection is established with a socket
io.on('connection',function(socket)
{	
	console.log('a user connected: '+ socket.client.id);	
	//Atributes a color to new connections based on socket.id string
	socket.emit('colorAttr', '#'+ hexFromString(socket.id));

	//Handles newMessage events received from clients
	socket.on('newMessage',function(data, room){
		console.log("new message received " + socket.id);
		console.log(data);
		//returns data back to the client
		socket.emit('newMessage',data);
		//sends data to other connected clients
		socket.broadcast.to(room).emit('newMessage',data);
	});
	//Adds socket to a room
	socket.on('joinRoom',function(room){
		console.log(socket.id + ' - user has joined room ' + room);
		socket.join(room);
		socket.broadcast.to(room).emit('sysMessage' , {'message':socket.id + ' - user has joined this room'});

		//Adds array of joined rooms to socket if it doesn't exist yet
		//This array serves to track what rooms a socket was connected to when it disconnected
		if(!socket.myRooms) socket.myRooms=[];		
		socket.myRooms.push(room);
	});
	//Removes socket from room
	socket.on('leaveRoom',function(room){
		console.log(socket.id + ' - user has left room ' + room);
		socket.leave(room);	

		socket.myRooms.splice(socket.myRooms.indexOf(room),1);
	});
	//Handles socket disconnections
	socket.on('disconnect',function(){
		console.log(socket.myRooms);
		if(socket.myRooms)
			socket.myRooms.forEach(function(room){
				io.sockets.in(room).emit('sysMessage', {'message': socket.id+ ' - user left the room'});
			});
		console.log("user has disconnected: "+ socket.conn.id + "\n");
	});
});

//Returns a hex color value based on first 6 elements of a string.
//Valid hex values are kept. Other values are assigned at random.
function hexFromString(str){
	var result = "";	
	while(str.length<6)
		str +="0";
	for(var i = 0; i<6; i++){
		//Does not accept hex values above B to avoid very light colors.
		//the randomly assigned values also only go up to B (11 in decimal).
		result += /^[0-9A-Ba-b]+$/.test(str[i]) ? str[i] : Math.floor(Math.random()*11).toString(16);		
	}
	return result;
}