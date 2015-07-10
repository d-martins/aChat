const dTime = 1000;
var chatControllers = angular.module('chatControllers',[]);

chatControllers.controller('chatCtrl', ['$scope','$routeParams','$location', function($scope, $routeParams, $location){	
	var port = $location.host() == 'localhost' ? 80 : 8000;
	var socket= io('http://'+$location.host()+':' + port);	
	$scope.messages = [];
	var color = '#555';
	
	//Receives an identifying color from the server.
	socket.on('colorAttr',function(data){
		color = data;
	});
	//Connects socket to appropriate room when connection is established
	socket.on('connect',function(){
		socket.emit('joinRoom',$routeParams.room);
		$scope.id = socket.id;
	});
	//Fires when connection to server is no longer available. Reloading and closing tab does not trigger.
	socket.on('disconnect',function(){
		
	})
	//Handles newMessage events received from the server
	socket.on('newMessage',function(data){		
		console.log("message received");
		console.log(data);
		$scope.messages.push(data);
		//Clears the message var to receive new values
		$scope.message = ""
		//$scope.$messages doesn't update with user input so we need to call $apply() to refresh the view
		$scope.$apply();
	});

	socket.on('sysMessage',function(data){		
		console.log("system message received");
		console.log(data);
		data.system = true;
		$scope.messages.push(data);
		//Clears the message var to receive new values
		$scope.message = ""
		//$scope.$messages doesn't update with user input so we need to call $apply() to refresh the view
		$scope.$apply();
	});

	//Sends the text set in the scope to the server. This function can be called from the view.
	$scope.post = function(){
		//if message is not defined, stops execution.
		if(!$scope.message)
			return;
		//Sends a newMessage event to the server
		socket.emit('newMessage', {'message' : $scope.message, 'color': color}, $routeParams.room);		
	}
}]);