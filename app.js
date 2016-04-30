var app = angular.module('myApp', ['angular-joyride', 'vesparny.fancyModal']);

app.controller('mainController', ['$scope', 'joyrideService', '$fancyModal', function($scope, joyrideService, $fancyModal){
	var joyride = joyrideService;
	console.log(joyrideService);
	$scope.start = function(){
		joyride.start = true;	
	}
	
	$scope.open = function () {
        var modal = $fancyModal.open({ template: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi nihil mollitia dicta unde quas nobis iusto nemo distinctio, dolor inventore aperiam quo consequatur aspernatur vel, nam autem illo error quis.</p>' });
        modal.opened.then(function() {
		  joyride.next();
		});
    };

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
			selector: "#button1",
			title: "Joyride Demo",
			content: "You can highlight elements on the page"
		},
		{
			type: "element",
			selector: "#title",
			title: "Joyride Demo",
			content: "You can change the placement of the joyride",
			placement: 'left'
		},
		{
			type: "function",
			function: $scope.open
		},
		{
			title: "Joyride Demo",
			content: "<p>You can open modals or change pages between steps</p>"
		}
	]

	
}]);