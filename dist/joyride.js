(function(){
var app = angular.module('angular-joyride', ['ngAnimate']);

////////******* Add default template to template cache *******//////////
app.run(['$templateCache', function($templateCache) {
  $templateCache.put('ngJoyrideDefault.html', '<div class="jr_container" id="jr_{{joyride.current}}"><div class="jr_step"><h4 ng-if="joyride.config.steps[joyride.current].title" class="jr_title">{{joyride.config.steps[joyride.current].title}}</h4><div ng-if="joyride.config.steps[joyride.current].content" class="jr_content" ng-bind-html="joyride.config.steps[joyride.current].content | jr_trust"></div></div><div class="jr_buttons"><div class="jr_left_buttons"><a class="jr_button jr_skip" ng-click="joyride.start = false">Skip</a></div><div class="jr_right_buttons"><a class="jr_button jr_prev" ng-click="joyride.prev()" ng-class="{\'disabled\' : joyride.current === 0}">Prev</a><a class="jr_button jr_next" ng-click="joyride.next()" ng-bind="(joyride.current == joyride.config.steps.length-1) ? \'Finish\' : \'Next\'"></a></div></div></div>');
}]);
////////////**********////////////////

////////******* Utility functions *******//////////
function removeClassByPrefix(el, prefix) {
    var regx = new RegExp('\\b' + prefix + '.*?\\b', 'g');
    el.className = el.className.replace(regx, '');
    return el;
}

function getElementOffset(element){
    var de = document.documentElement;
    var box = element.getBoundingClientRect();
    var top = box.top + window.pageYOffset - de.clientTop;
    var left = box.left + window.pageXOffset - de.clientLeft;
    return { top: top, left: left };
}

function getScroll(){
 if(window.pageYOffset!= undefined){
  return pageYOffset;
 }
 else{
  var sy, d= document, r= d.documentElement, b= d.body;
  sy= r.scrollTop || b.scrollTop || 0;
  return [sx, sy];
 }
}

function scrollToElement(to) {
    var element = document.body,
      start = element.scrollTop,
        change = to - start,
      duration = Math.min((4 * Math.abs(change)), 1000),
        currentTime = 0,
        increment = 20;

  if (Math.abs(change) > 10) {
      function easeInOutQuad (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    };
          
      var animateScroll = function(){        
          currentTime += increment;
          var val = easeInOutQuad(currentTime, start, change, duration);
          element.scrollTop = val;
          if(currentTime < duration) {
              setTimeout(animateScroll, increment);
          }
      };
      animateScroll();
  }
}

////////******* Joyride Directive *******//////////
var joyrideDirective = function($animate, joyrideService, $compile, $templateCache, $timeout, $window){
    return {
      restrict: 'E',
      scope: {},
      link: function(scope, element, attrs){
        
        
        scope.joyride = joyrideService;
        var joyrideContainer,
            overlay = '<div class="jr_overlay"></div>',
            template = $templateCache.get(scope.joyride.config.template) || $templateCache.get('ngJoyrideDefault.html');

        angular.element($window).bind('resize', function(){
          if (scope.joyride.start) {
            setPos();
          }
        });

        function appendJoyride(){
          var appendHtml = $compile(template)(scope),
              currentStep = scope.joyride.config.steps[scope.joyride.current],
              divElement = angular.element(document.querySelector('body'));

          if (currentStep.type === 'element' && !currentStep.appendToBody) {
            var divElement = angular.element(document.querySelector(currentStep.selector));


          }
          
          divElement.append(appendHtml);
          joyrideContainer = document.querySelector('.jr_container');
          angular.element(joyrideContainer).append("<div class='triangle'></div>");
          if (scope.joyride.start) {
            angular.element(joyrideContainer).addClass('jr_start');
          }
        }
        
        function removeJoyride(){
          angular.element(joyrideContainer).remove();
        }
 
        //////// Watching for change in the start variable
          scope.$watch('joyride.start', function(show, oldShow) {
            if (show !== oldShow || show === true) {

              //////// Joyride was opened
              if (show) {
                appendJoyride();
                
                $timeout(function(){
                  angular.element(document.querySelector('body')).addClass('jr_active');
                  $animate.addClass(joyrideContainer, 'jr_start').then(scope.joyride.config.onStart);
                  scope.joyride.transitionStep = false;
                  angular.element(document.querySelector('body')).append(overlay);
                  setPos();
                }, 0);
              }

              ////////// Joyride was closed
              if (!show) {
                angular.element(document.querySelector('body')).removeClass('jr_active');
                $animate.removeClass(joyrideContainer, 'jr_start').then(joyrideEnded);
                angular.element(document.querySelector('.jr_overlay')).remove()
                if (document.querySelector(".jr_target")) {
                  angular.element(document.querySelector(".jr_target")).removeClass('jr_target');  
                }
              }
          }
        });

        //////////// Watching for transition trigger
        scope.$watch('joyride.transitionStep', function(val, oldVal) {
          if (val !== oldVal) {
            if (val) {

              if (val == 'next' && scope.joyride.current == scope.joyride.config.steps.length-1) {
                scope.joyride.start = false;
              }

              else if (val == 'prev' && scope.joyride.current == 0) {
                return;
              }

              else{

                $animate.removeClass(joyrideContainer, 'jr_transition').then(beforeTransition);
              }
              
            }
            if (!val) {


              $animate.addClass(joyrideContainer, 'jr_transition');
            }
          }
        });

        ////// check for afterStep function before going to next step
        function beforeTransition(){
          if (typeof scope.joyride.config.steps[scope.joyride.current].afterStep === "function") {
            scope.joyride.config.steps[scope.joyride.current].afterStep(afterTransition);
          }

          else{
            afterTransition();
          }
        }


        ////// Set position and current step after joyride transitions out
        function afterTransition(){

          ////// transitions in the next step
            function transitionIn(){
              

              scope.joyride.transitionStep = false;  
              if (typeof scope.joyride.config.onStepChange === "function") {
                scope.joyride.config.onStepChange();
              }
              removeJoyride();
              appendJoyride();
              $timeout(function(){
                setPos();
              })
            }


            if (scope.joyride.transitionStep == 'next') {
              scope.joyride.current++;
            }
            else{
              scope.joyride.current--;
            }

            
            

            // if step contains a beforeStep function
            // execute it first before transitioning in
            // else just transition in
              if (typeof scope.joyride.config.steps[scope.joyride.current].beforeStep === "function") {
                scope.joyride.config.steps[scope.joyride.current].beforeStep(transitionIn);
              }

              else{
                transitionIn();
              }
            
            
            
        }

        // Reset variables after joyride ends
        var joyrideEnded = function(){
          removeJoyride();
          scope.joyride.current = 0;
          scope.joyride.transitionStep = false;
          scope.joyride.config.onFinish();
        }

        // Handles joyride positioning
        var setPos = function(){
          var currentStep = scope.joyride.config.steps[scope.joyride.current];

          $timeout(function(){

            removeClassByPrefix(joyrideContainer, "jr_pos_");
            var step = scope.joyride.config.steps[scope.joyride.current];


          // If step type equals 'element' set position and styles
          if (step.type == 'element') {
            joyrideContainer.removeAttribute('style');
            angular.element(joyrideContainer).addClass('jr_element');
            if (document.querySelector(".jr_target")) {
              angular.element(document.querySelector(".jr_target")).removeClass('jr_target');  
            }
            
            var jrElement = angular.element(document.querySelector(step.selector));
            var position = getElementOffset(jrElement[0]);
            jrElement.addClass('jr_target');

            


            // Check where the step should be positioned then change the position property accordingly 
            var placement = step.placement || 'bottom';
            angular.element(joyrideContainer).addClass('jr_pos_'+placement);

            if (currentStep.appendToBody){
              if (placement === 'top' || placement === 'bottom') {
                if (placement === 'top') {
                  var height = joyrideContainer.clientHeight;
                  position.top -= height + 20;
                }

                else {
                  var height = jrElement[0].clientHeight;
                  position.top += height + 20;
                }
                var jrWidth = joyrideContainer.clientWidth,
                    targetWidth = jrElement[0].clientWidth;
                
                // var leftOffset = Math.max(jrWidth, targetWidth) - Math.min(jrWidth, targetWidth)/2;
                // position.left = Math.max(leftOffset, position.left) - Math.min(leftOffset, position.left);
                position.left = ((position.left + targetWidth/2) - jrWidth/2 );
                
                if (position.left < 0) {
                  var triangle = document.querySelector(".jr_container .triangle");
                  triangle.style.left = position.left + Math.abs((jrWidth - targetWidth + triangle.offsetWidth)/2)  + 'px';
                  triangle.style.right = "auto";
                  position.left = 0;

                }

                else if((position.left + jrWidth) > angular.element($window).width()){
                  var tempPos = position.left + (jrWidth/2)
                  var triangle = document.querySelector(".jr_container .triangle");
                  triangle.style.right = "auto";
                  position.left = angular.element($window).width() - jrWidth;
                  triangle.style.left = tempPos - position.left - triangle.offsetWidth / 2  + 'px';
                }
                
                else{

                  var triangle = document.querySelector(".jr_container .triangle");
                  triangle.style.left = 0;
                  triangle.style.right = 0;
                }
                
              }

              else{
                if (placement === 'left') {
                  var width = joyrideContainer.clientWidth;
                  position.left -= width + 20;

                }

                else {
                  var width = jrElement[0].clientWidth;
                  position.left += width + 20;
                }
                position.top -= 20;
              }

              // Set joyride position
              joyrideContainer.style.left = position.left + 'px';
              joyrideContainer.style.top = position.top + 'px';
              joyrideContainer.style.right = 'auto';
              joyrideContainer.style.bottom = 'auto';

              
            
            }

            // Scroll to element if scroll is enabled
              if (step.scroll !== false) {
                if (placement === 'bottom') {
                  scrollToElement(position.top - jrElement[0].clientHeight);
                }
                else{
                  scrollToElement(position.top);
                }
                
              }
          }


          // If step isn't an element
          else{
            angular.element(joyrideContainer).removeClass('jr_element');
            if (document.querySelector(".jr_target")) {
              angular.element(document.querySelector(".jr_target")).removeClass('jr_target');  
            }
            joyrideContainer.style.left = '';
            joyrideContainer.style.top = getScroll(placement, joyrideContainer) + 100 + 'px';
          }
      });

        }
      }

    }

  }

////////******* Joyride Service *******//////////
  var joyrideService = function(){
    return {
      current : 0,
      transitionStep: true, 
      start: false,
      config: {
        overlay: true,
        template: false,
        steps : [],
        onStepChange: function(){},
        onFinish: function(){},
        onStart: function(){}
      },
      next: function(){
        this.transitionStep = 'next';
      },
      prev: function(){
        this.transitionStep = 'prev';
      },
      goTo: function(step){
        this.start = true;
        if (step) {
          this.current = step;
        }
      }
    };
  }

app.filter('jr_trust', [
  '$sce',
  function($sce) {
    return function(value, type) {
      // Defaults to treating trusted text as `html`
      return $sce.trustAsHtml(value);
    }
  }
]);

app.factory('joyrideService', [joyrideService]);
app.directive('joyride', ['$animate', 'joyrideService', '$compile', '$templateCache', '$timeout', '$window', joyrideDirective]);

})();