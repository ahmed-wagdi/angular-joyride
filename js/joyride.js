(function(){
var app = angular.module('angular-joyride', ['ngAnimate']);
app.run(function($templateCache) {
  $templateCache.put('ngJoyrideDefault.html', '<div class="jr_container" id="jr_{{joyride.current}}"><div class="jr_step"><h4 ng-if="joyride.config.steps[joyride.current].title" class="jr_title">{{joyride.config.steps[joyride.current].title}}</h4><div ng-if="joyride.config.steps[joyride.current].content" class="jr_content" ng-bind-html="joyride.config.steps[joyride.current].content | jr_trust"></div></div><div class="jr_buttons"><div class="jr_left_buttons"><a class="jr_button jr_skip" ng-click="joyride.config.start = false">Skip</a></div><div class="jr_right_buttons"><a class="jr_button jr_prev" ng-click="joyride.prev()" ng-class="{\'disabled\' : joyride.current === 0}">Prev</a><a class="jr_button jr_next" ng-click="joyride.next()" ng-bind="(joyride.current == joyride.config.steps.length-1) ? \'Finish\' : \'Next\'"></a></div></div></div>');
});

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

var joyrideDirective = function($animate, joyrideService, $compile, $templateCache, $timeout){
    return {
      restrict: 'E',
      scope: {},
      link: function(scope, element, attrs){
        scope.joyride = joyrideService;
        var joyrideContainer;
        var overlay = '<div class="jr_overlay"></div>';
        
        function appendJoyride(){
          var template = $templateCache.get(scope.joyride.config.template) || $templateCache.get('ngJoyrideDefault.html');
          if (scope.joyride.config.overlay) {
            template += overlay;
          }
          
          var divElement = angular.element(document.querySelector('body'));
          var appendHtml = $compile(template)(scope);
          divElement.append(appendHtml);
          joyrideContainer = document.querySelector('.jr_container');
        }
        
        function removeJoyride(){
          angular.element(joyrideContainer).remove();
          angular.element(document.querySelector('.jr_overlay')).remove();
        }
 
        //////// Watching for change in the start variable
          scope.$watch('joyride.config.start', function(show, oldShow) {
            if (show !== oldShow || show === true) {

              //////// Joyride was opened
              if (show) {
                appendJoyride();
                
                
                $timeout(function(){
                  angular.element(document.querySelector('body')).addClass('jr_active');
                  $animate.addClass(joyrideContainer, 'jr_start').then(scope.joyride.config.onStart);
                  setPos();
                }, 0);
              }

              ////////// Joyride was closed
              if (!show) {
                angular.element(document.querySelector('body')).removeClass('jr_active');
                $animate.removeClass(joyrideContainer, 'jr_start').then(joyrideEnded);
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
                scope.joyride.config.start = false;
              }

              else if (val == 'prev' && scope.joyride.current == 0) {
                return;
              }

              else{
                $animate.addClass(joyrideContainer, 'jr_transition').then(beforeTransition);
              }
              
            }
            if (!val) {
              $animate.removeClass(joyrideContainer, 'jr_transition');
            }
          }
        });

        // check for afterStep function before going to next step
        function beforeTransition(){
          if (typeof scope.joyride.config.steps[scope.joyride.current].afterStep === "function") {
            scope.joyride.config.steps[scope.joyride.current].afterStep(afterTransition);
          }

          else{
            afterTransition();
          }
        }


        // Set position and current step after joyride transitions out
        function afterTransition(){

          // transitions in the next step
            function transitionIn(){
              setPos();

              scope.joyride.transitionStep = false;  
              
              scope.joyride.config.onStepChange();
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
          $timeout(function(){
          removeClassByPrefix(joyrideContainer, "jr_pos_");
          var step = scope.joyride.config.steps[scope.joyride.current];


          // If step type equals 'element' set position and styles
          
          if (step.type == 'element') {
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

              position.left = Math.abs(position.left - (jrWidth - targetWidth)/2);
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

            if (step.scroll !== false) {
              if (placement === 'bottom') {
                scrollToElement(position.top - jrElement[0].clientHeight);
              }
              else{
                scrollToElement(position.top);
              }
              
            }
            
            // Set joyride position
            joyrideContainer.style.left = position.left + 'px';
            joyrideContainer.style.top = position.top + 'px';

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

  var joyrideService = function(){
    return {
      current : 0,
      transitionStep: false, 
      config: {
        start: false,
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
app.directive('joyride', ['$animate', 'joyrideService', '$compile', '$templateCache', '$timeout', joyrideDirective]);

})();