/*
	By Osvaldas Valutis, www.osvaldas.info
	Available for use under the MIT License
*/

;( function ( document, window, index )
{
	var s = document.body || document.documentElement, s = s.style, prefixAnimation = '', prefixTransition = '';

	if( s.WebkitAnimation == '' )	prefixAnimation	 = '-webkit-';
	if( s.MozAnimation == '' )		prefixAnimation	 = '-moz-';
	if( s.OAnimation == '' )		prefixAnimation	 = '-o-';

	if( s.WebkitTransition == '' )	prefixTransition = '-webkit-';
	if( s.MozTransition == '' )		prefixTransition = '-moz-';
	if( s.OTransition == '' )		prefixTransition = '-o-';

	Object.prototype.onCSSAnimationEnd = function( callback )
	{
		var runOnce = function( e ){ callback(); e.target.removeEventListener( e.type, runOnce ); };
		this.addEventListener( 'webkitAnimationEnd', runOnce );
		this.addEventListener( 'mozAnimationEnd', runOnce );
		this.addEventListener( 'oAnimationEnd', runOnce );
		this.addEventListener( 'oanimationend', runOnce );
		this.addEventListener( 'animationend', runOnce );
		if( ( prefixAnimation == '' && !( 'animation' in s ) ) || getComputedStyle( this )[ prefixAnimation + 'animation-duration' ] == '0s' ) callback();
		return this;
	};

	Object.prototype.onCSSTransitionEnd = function( callback )
	{
		var runOnce = function( e ){ callback(); e.target.removeEventListener( e.type, runOnce ); };
		this.addEventListener( 'webkitTransitionEnd', runOnce );
		this.addEventListener( 'mozTransitionEnd', runOnce );
		this.addEventListener( 'oTransitionEnd', runOnce );
		this.addEventListener( 'transitionend', runOnce );
		this.addEventListener( 'transitionend', runOnce );
		if( ( prefixTransition == '' && !( 'transition' in s ) ) || getComputedStyle( this )[ prefixTransition + 'transition-duration' ] == '0s' ) callback();
		return this;
	};
}( document, window, 0 ));


var app = angular.module('myApp', ['angular-joyride', 'vesparny.fancyModal']);

app.controller('mainController', ['$scope', 'joyrideService', '$fancyModal', function($scope, joyrideService, $fancyModal){
	var joyride = joyrideService;

	$scope.start = function(){
		joyride.start = true;	
		console.log(joyride);
	}
	console.log(joyride);
	var openModal = function (resume) {
        var modal = $fancyModal.open({ 
        	template: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi nihil mollitia dicta unde quas nobis iusto nemo distinctio, dolor inventore aperiam quo consequatur aspernatur vel, nam autem illo error quis.</p>',
        	overlay: false
        });
        modal.opened.then(function() {
        	document.queryselector('fancymodal-content').onCSSAnimationEnd( function()
			{
			    resume();
				console.log(true);
			});
		  
		});
    };

    var closeModal = function (resume) {
        $fancyModal.close();
        resume();
    };

	joyride.config = {
		steps : [
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
				selector: ".fancymodal",
				title: "Joyride Demo",
				content: "<p>You can open modals or change pages between steps</p>",
				beforeStep: openModal,
				afterStep: closeModal,
				scroll: false
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
			}
		]
	}

	
}]);