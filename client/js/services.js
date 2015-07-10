var chatServices = angular.module('chatServices', [
	'ngResource'
	]);

//Defines the Entry service that interacts with the entries resource from the server app.
chatServices.factory('Entry', ['$resource',
	function($resource){
		//Defines the possible actions for the entries resource
		var actions = {
			getEntries:  {method: "GET", isArray: true},
			newEntry: {method: "POST", isArray: true}
		};

		return $resource('http://127.0.0.1:8000/entries',{} ,actions);
	}]);

