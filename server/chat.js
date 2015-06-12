//imports 
var formidable = require('formidable');
var http = require('http');
var urlUtils = require('url');
var fs = require('fs');

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
http.createServer(function(req, res){
	//Parses the url into an object, easier to extract information from.
	var parsedUrl = urlUtils.parse(req.url, true);

	var method = routes[parsedUrl.pathname];
	//If the route is not defined, set not found as response.
	if(!method)
		method = notFound;	
	//Run appropriate routine according to path
	method(req, res);	

}).listen(port);

//--------------------------
//		***Routes***
//--------------------------
function index(req, res){
	res.writeHead(200, {'content-type': 'text/html'});
	//Sends index.html as the response
	fs.createReadStream('index.html').pipe(res);
}

function entries(req, res){
	if(req.method == "GET"){
		//Allows requests from the localhost client
		res.writeHead(200, {'content-type': 'text/json',
							'Access-Control-Allow-Origin' : 'http://127.0.0.1:8080'
							});
		//Sends the json object as the response
		res.end(JSON.stringify(messages));
	}

	else if(req.method == "POST"){
		//Formidable parses form data for easier processing
		var form = new formidable.IncomingForm();
		//Parses the form data
		form.parse(req, function(err, field, files){
			res.writeHead(200, {'content-type': 'text/json'});
			//Updates the messages array with the new entry
			addMessage(field.message);
			//Sends the updated json object as the response
			res.end(JSON.stringify(messages));
		});
	}
}

function notFound(req,res){
	res.writeHead(404, 'Not found');
	res.end('Resource not found');
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