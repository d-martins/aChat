var chatControllers = angular.module('chatControllers',[]);

chatControllers.controller('entriesCtrl', ['$scope','Entry', function($scope, Entry){
	$scope.entries = Entry.getEntries();
}]);