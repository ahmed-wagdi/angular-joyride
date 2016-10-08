var app = angular.module('myApp', ['angular-joyride', 'vesparny.fancyModal']);

app.controller('mainController', ['$scope', 'joyrideService', '$fancyModal', function($scope, joyrideService, $fancyModal){
	var joyride = joyrideService;
	console.log(joyrideService);
	$scope.start = function(){
		joyride.start = true;	
	}
	
	function openModal(resume){
		modal = $fancyModal.open({ 
			template: '<div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus iusto id voluptatem eum beatae sunt quod dolorem voluptates ducimus tenetur hic, labore assumenda voluptate quam nisi alias provident, nam? Animi! <a class="button">Click</a></div>',
			overlay: false
		}).opened.then(function(){
			$('.fancymodal .fancymodal-content-opening').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
				resume();
			});
			
		})
	}

	function closeModal(resume){
		$fancyModal.close();
		resume();
	}

	joyride.steps = [
		{
			title: "Joyride Demo",
			content: "<p>Welcome to the joyride demo!</p><p>This is a simple joyride directive built to have minimal dependencies.</p>"
		},
		{
			title: "Joyride Demo",
			content: "This can be used to provide a step by step walkthrough of your website.",
			beforeStep: closeModal
		},
		{
			type: "element",
			selector: "#button1",
			title: "Joyride Demo",
			content: "You can highlight elements on the page",
			beforeStep: openModal
		},
		{
			type: "element",
			selector: "#title",
			title: "Joyride Demo",
			content: "You can change the placement of the joyride",
			placement: 'left',
			beforeStep: closeModal
		},
		{
			type: "function",
			function: $scope.open
		},
		{
			type: "element",
			selector: ".fancymodal",
			title: "Joyride Demo",
			content: "<p>You can open modals or change pages between steps</p>"
		}
	]

	
}]);