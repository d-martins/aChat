const dTime = 1000;
var chatControllers = angular.module('chatControllers',[]);

chatControllers.controller('entriesCtrl', ['$scope','$timeout','Entry', function($scope, $timeout, Entry){
	
	var socket= io('http://localhost:8000');
	$scope.messages = [];

	//Handles newMessage events received from the server
	socket.on('newMessage',function(data){		
		$scope.messages.push(data);
		//$scope.$messages doesn't update with user input so we need to call $apply() to refresh the view
		$scope.$apply();
	});
	//Sends the text set in the scope to the server. This function can be called from the view.
	$scope.post = function(){
		//if message is not defined, stops execution.
		if(!$scope.message)
			return;
		//Sends a newMessage event to the server
		socket.emit('newMessage', {'message' : $scope.message});
		//Clears the message var to receive new values
		$scope.message = ""
	}
}]);