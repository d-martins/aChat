var chatApp =  angular.module('chatApp', [
	'ngRoute',
	'chatControllers',
	'chatServices',
	'luegg.directives'
	]);

chatApp.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when('/:room',{
			templateUrl:'partials/chat.html',
			controller:'chatCtrl'
		})
		.otherwise({
			redirectTo: '/global'
		});
}])

//Changes element background-color property accroding to 'color' attribute.
chatApp.directive('myColorizer', function(){
	return{
		restrict: "C",
		scope: {
			color: '@'
		},
		link: function(scope, element, attrs){			
			var color = attrs.color;
			element.css({'background-color': color});				
		}
	}
});