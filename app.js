var app = angular.module('myApp', ['angular-joyride']);

app.controller('mainController', ['$scope', 'joyrideService', function($scope, joyrideService){
	var joyride = joyrideService;
	console.log(joyrideService);
	$scope.start = function(){
		joyride.start = true;	
	}
	

	joyride.steps = [
		{
			title: "Joyride Demo",
			content: "<p>Welcome to the joyride demo!</p><p>This is a simple joyride directive built to have minimal dependencies.</p>"
		},
		{
			title: "Joyride Demo",
			content: "This can be used to provide a step by step walkthrough of your website."
		},
		{
			type: "element",
			selector: "#button",
			title: "Joyride Demo",
			content: "You can highlight elements on the page"
		}
	]
}]);