var app = angular.module('myApp', ['angular-joyride']);

app.controller('mainController', ['$scope', 'joyrideService', function($scope, joyrideService){
	var joyride = joyrideService;
	console.log(joyrideService);
	joyride.start = true;

	joyride.steps = [
		{
			title: "Step 1",
			content: "Test"
		}
	]
}]);