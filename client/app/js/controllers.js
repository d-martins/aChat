const dTime = 1000;
var chatControllers = angular.module('chatControllers',[]);

chatControllers.controller('entriesCtrl', ['$scope','$timeout','Entry', function($scope, $timeout, Entry){
	
	(function repeat(){
		//Requests all entries and reschedules this function when the response is received
		Entry.getEntries(function(resource){
			$timeout(repeat, dTime);	
			$scope.entries = resource;
		});		
	})();

	$scope.post = function(){
		//if message is not defined, stop execution of this function
		if(!$scope.message)
			return
		//updates entries according to the received response
		$scope.entries = Entry.newEntry({message: $scope.message});
		//Clears the message var to receive new values
		$scope.message = ""
	}
}]);