//imports 
var formidable = require('formidable');
var http = require('http').createServer(handler);
var urlUtils = require('url');
var fs = require('fs');
var io = require('socket.io')(http);

//variables
var port = process.argv[2];
var messages = [];
var limit = 10;
var routes = {
	'/' : index,
	'/index' : index,
	'/entries' : entries
}

//Sets up a server and listens for connection on the designated port
function handler(req, res){
	//Parses the url into an object, easier to extract information from.
	var parsedUrl = urlUtils.parse(req.url, true);

	var method = routes[parsedUrl.pathname];
	//If the route is not defined, set not found as response.
	if(!method)
		method = notFound;	
	//Run appropriate routine according to path
	method(req, res, parsedUrl);	

};
http.listen(port);

//When a connection is established with a socket
io.on('connection',function(socket)
{	
	console.log('a user connected: '+ socket.client.id);	

	socket.join('global');
	//Handles newMessage events received from clients
	socket.on('newMessage',function(data){
		console.log("new message received " + socket.id);
		console.log(data);
		//returns data back to the client
		socket.emit('newMessage',data);
		//sends data to other connected clients
		socket.broadcast.emit('newMessage',data);
	});
	//Handles socket disconnections
	socket.on('disconnect',function(){
		console.log("user has disconnected: "+ socket.conn.id + "\n");
	})
});

//--------------------------
//		***Routes***
//--------------------------
function index(req, res){
	res.writeHead(200, {'content-type': 'text/html'});
	//Sends index.html as the response
	fs.createReadStream('index.html').pipe(res);
}

function entries(req, res){
	console.log("\n" + "New access to entries:\nRequest Method: " + req.method +"\n");
	if(req.method == "GET"){
		//Allows requests from anyone
		res.writeHead(200, {'content-type': 'text/json',
							'Access-Control-Allow-Origin' : '*'
							});
		//Sends the json object as the response
		res.end(JSON.stringify(messages));
	}
	else if(req.method == "OPTIONS"){
		res.writeHead(200,{ 'Access-Control-Allow-Origin' : '*',
							'Access-Control-Allow-Methods' : 'HEAD, POST,GET,PUT,OPTIONS',
							'Access-Control-Allow-Headers' : 'Content-Type'
						});
		res.end();
	}
	else if(req.method == "POST"){
		res.writeHead(200, {'content-type': 'text/json',
							'Access-Control-Allow-Origin' : '*'
						});
		//Formidable parses form data for easier processing
		var form = new formidable.IncomingForm();
		//Parses the form data
		form.parse(req, function(err, field, files){
			console.log("fields: " + JSON.stringify(field) +"\n");
			if(field.message){
				//Updates the messages array with the new entry
				addMessage(field.message);
			}
			//Sends the updated json object as the response
			res.end(JSON.stringify(messages));
		});
	}
}
//Function to execute for an undefined path
function notFound(req,res,url){
	//Tries to load the file on the specefied path and returns 404 not found if it fails
	fs.readFile( __dirname + url.pathname,function(err,data){
		if(err){
			res.writeHead(404, 'Not Found');
     		res.end('Error loading resource');
		}
		res.writeHead(200);
		res.end(data)
	});	
}

//--------------------------
//		***Other***
//--------------------------
//Sorts an array based on one its properties.
function orderArrayByField(array, field){
	return array.sort(function(a,b){	
		//converts the values to a string and compares them for sorting.	
		return  (""+a[field]).localeCompare((""+b[field]));
	});
}

//Adds a new entry to the messages array
function addMessage(msg){
	var time = (new Date()).getTime();
	//If the array is too big, removes the oldest entries
	while (messages.length >= limit){
		messages.shift();		
	}
	messages.push({timestamp: time, message: msg});
}