# angular-joyride

A simple joyride directive for angular. This is inspired by [ng-joyride](https://github.com/abhikmitra/ng-joyride) and works very similarly but with less dependencies. The only dependency is [ngAnimate](https://docs.angularjs.org/api/ngAnimate), no jquery or any other libraries required.

## [Demo](http://ahmed-wagdi.github.io/angular-joyride)

## Installing
Install with npm:
```
npm install angular-joyride
```

Install with bower:
```
bower install angular-joyride
```

 Inject `angular-joyride` and `ngAnimate` into your angular module:
```
angular.module('MyApp', ['ngAnimate', 'angular-joyride']);
```

 Add the `joyride` directive as an element:
```
<joyride></joyride>
```

## Usage
This directive relies on a service for handling the joyride content and configuration, so include the `joyrideService` in your controller:
````
app.controller('MainCtrl', function($scope, joyrideService) {
  var joyride = joyrideService;

  joyride.start = true;
  
  joyride.config = {
    overlay: false,
    onStepChange: function(){ // Code Here },
    onStart: function(){ // Code Here },
    onFinish: function(){ // Code Here },
    steps : [
      {
        title: "Title 2",
        content: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus, quidem, quia mollitia harum tempora laudantium deserunt deleniti. Expedita, soluta, atque maxime minus commodi quaerat ipsum reiciendis veritatis eum laboriosam incidunt.</p><p>another example</p>'
      },
      {
        type: 'element',
        selector: "#title",
        title: "Title 1",
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus, quidem, quia mollitia harum tempora laudantium deserunt deleniti. Expedita, soluta, atque maxime minus commodi quaerat ipsum reiciendis veritatis eum laboriosam incidunt.',
        placement: 'top'
      }
    ]
  },

});
````

#### Starting the joyride
The `start` property can be used to trigger the joyride, setting it to `true` starts the joyride and `false` will end it.

### Configuration
- __steps -__ The steps to be used in the joyride, expects an array of objects.
- __overlay -__ Display overlay, default is true.
- __template -__ This can be used to add a custom template for the joyride, a path to an html file should be given.
- __onStepChange -__ Callback for step change.
- __onStart -__ Callback for joyride start.
- __onFinish -__ Callback for joyride end.


## Joyride Steps
The `steps` property accepts an array containing the steps of the joyride, each step should be an object with the following properties:

| Property        | Type | Description   
| :------------- |:------------- |:-------------
| type     | String | Type of step, default is "Regular"
| title      | String | Title of step   
| content | String | Step content, can incude html tags
| selector | String | If type is set to "element" this is the selector used to find the element
| placement | String | If type is set to "element" determines the placement of the container, default is "bottom"
| appendToBody | boolean | If type is set to "element" setting to true appends the joyride to the body instead of the element the joyride is pointing to, default is false
| scroll | boolean | If type is set to "element" can disable/enable scrolling to element, default is true
| beforeStep | function | Function called before step transitions in, can pause joyride until some code executes

#### Step Types
There are 2 available types:
* __Regular:__ The default type, appears as a regular pop-up.
* __Element:__ Highlights a certain element in the DOM. Requires the `selector` property to work and can be positioned with the `placement` property with top, right, bottom or left.

### Before step callback
This should be used if you want to pause between steps to execute some code first, for example opening a modal or going to a different page before going to the next step. If you use the `beforeStep` callback then the joyride will be paused, you have to let it know once you're done so that it can continue, you can do that by using the `resumeJoyride` function.

In the example below the modal should be open in the second step but it should be closed in the first and third step:
````
joyride.config.steps = [
    {
      title : 'Step 1',
      content: "<p>This step is on the main page with the modal closed.</p>",
      beforeStep: closeModal
    },
    {
      type: 'element',
      selector: '.modal .button',
      title: "Step 2",
      content: "This step should wait for the modal to open first!",
      beforeStep: openModal,
      scroll: false
    },
    {
      title : 'Step 3',
      content: "<p>Last step is on the main page with the modal closed.</p>",
      beforeStep: closeModal
    }
  ];
  
  // Make sure to call resume to let the joyride know it should continue
  function openModal(){
    modal.open.then(function(){
        joyride.resumeJoyride();
    });
  }
  
  function closeModal(){
    modal.close.then(function(){
        joyride.resumeJoyride();
    });
  }
````

#### Multipage Joyride
You can also use the `beforeStep` callback to navigate between different pages in between steps.

Here's an example for `ui-router`, if you're using an older version of ui-router then you might need to use the $stateChange* events instead of $transitions:

1. In your controller use `beforeStep` to navigate to a different state:
  ````
  joyride.config = {
    steps : [
      {
        title: "Step 1",
        content: "<p>Welcome to the joyride demo!</p><p>This is a simple joyride directive built to have minimal dependencies.</p>"
      },
      {
        title: "Step 2",
        content: "<p>Welcome to the joyride demo!</p><p>This is a simple joyride directive built to have minimal dependencies.</p>",
        beforeStep: toHome
      },
      {
        title: "Step 3",
        content: "<p>Welcome to the joyride demo!</p><p>This is a simple joyride directive built to have minimal dependencies.</p>",
        beforeStep: toAbout
      }
    ]
  }
  
  function toHome(){
    $state.go("home");
  }
  
  function toAbout(){
    $state.go("about");
  }
  
  ````

2. To resume the joyride we need to call `resumeJoyride` after the state changes and if no state change takes place at all:
  ````
  app.run(function($transitions, joyrideService, $timeout) {
    
    /** After changing states call resumeJoyride 
     *  to un-pause. The $timeout just fixes an
     *  animation issue if the next step is of
     *  type "element"
    **/
    $transitions.onFinish({ }, function(trans) {
      trans.promise.then(function(response){
        $timeout(function(){
          joyrideService.resumeJoyride();  
        })
      });
    });

    /** Handles the case when you're beforeStep 
     *  function calls $state.go and tries to 
     *  go to the current state.
    **/
    $transitions.onBefore({ }, function(trans) {
      trans.promise.then(null,function(response){
          joyrideService.resumeJoyride();  
      })
    });
    
  })
  ````


### Responsive Positioning
It's possible to switch the placement of a step based on the screen width by declaring a `responsive` property inside a step object:

````
    {
      type: 'element',
      selector: '.button',
      title: "Step 2",
      content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
      placement: 'left',
      responsive: {
        breakpoint: 600,
        placement: 'top'
      }
    }
````
The `responsive` object takes 2 properties, the breakpoint where you want to change the placement (in pixels) and the new placement, if no placement is given then it will be set to bottom by default. This directive only supports the use of 1 breakpoint.

### Methods
| Method        | Description           
| :------------- |:-------------
| next     | Goes to the next step 
| prev      | Goes to the previous step
| goTo | Goes to a specific step, requires a number representing the index of the step     
__Usage:__
````
$scope.customNext = function(){
    joyride.next();
}

$scope.go = function(index){
    joyride.goTo(index)
}
````




## Animations
This directive relies on `ngAnimate` and the [$animate](https://docs.angularjs.org/api/ng/service/$animate) service for handling animation classes. By default the joyride has simple fade in/out animations, but you can customize them by using the `.jr_start` class for start/end animations and the `.jr_transition` for step transition animations:
````
.jr_container{
    transition: opacity 0.3s, transform 0.3s
}

//////// START/END ANIMATIONS
.jr_container.jr_start-add {
  opacity: 0;
}
.jr_container.jr_start-add-active {
  opacity: 1;
}

.jr_container.jr_start-remove {
  opacity: 1;
}
.jr_container.jr_start-remove-active {
  opacity: 0;
}
//////////// STEP TRANSITION ANIMATIONS
.jr_container.jr_transition{
  opacity: 0;
}
.jr_container.jr_transition-add {
  opacity: 1;
  transform: translateY(0px);
}
.jr_container.jr_transition-add-active {
    opacity: 0;
    transform: translateY(-100px);
}

.jr_container.jr_transition-remove {
    opacity: 0;
    transform: translateY(-100px);
}

.jr_container.jr_transition-remove-active {
  opacity: 1;
    transform: translateY(0px);
}
````

### Custom Templates
If you want to use your own template for the joyride then add the template in an html file then enter the path to that file in your controller similar to the following:

````
joyride.config.template = 'partials/myCustomTemplate.html'
````

Your template must contain a div with the class `jr_container`, i would recommend copying the html of the default template and editing it, you can find the html below:
````
<div class="jr_container" id="jr_step_{{joyride.current}}">
  <div class="jr_step">
    <h4 ng-if="joyride.config.steps[joyride.current].title" class="jr_title">{{joyride.config.steps[joyride.current].title}}</h4>
    <div ng-if="joyride.config.steps[joyride.current].content" class="jr_content" ng-bind-html="joyride.config.steps[joyride.current].content | jr_trust"></div>
  </div>
  <div class="jr_buttons">
    <div class="jr_left_buttons">
      <a class="jr_button jr_skip" ng-click="joyride.start = false">Skip</a>
    </div>

    <div class="jr_right_buttons">
      <a class="jr_button jr_prev" ng-click="joyride.prev()" ng-class="{'disabled' : joyride.current === 0}">Prev</a>
      <a class="jr_button jr_next" ng-click="joyride.next()" ng-bind="(joyride.current == joyride.config.steps.length-1) ? 'Finish' : 'Next'"></a>
    </div>
  </div>
</div>
````

## License

The MIT License (MIT)

Copyright (c) 2016 Ahmed Wagdi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.