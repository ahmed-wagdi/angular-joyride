# angular-joyride

__Important:__ This directive is still in the testing phase.

A simple joyride directive for angular. This is inspired by [ng-joyride](https://github.com/abhikmitra/ng-joyride) and works very similarly but with less dependencies. The only dependency is [ngAnimate](https://docs.angularjs.org/api/ngAnimate), no jquery or any other libraries required.

## Installing
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
- __template -__ If you don't want to use the joyride's default template this can be used to add a custom template.
- __onStepChange -__ Callback for step change.
- __onStart -__ Callback for joyride start.
- __onFinish -__ Callback for joyride end.


## Joyride Steps
The `steps` property accepts an array containing the steps of the joyride, each step should be an object with the following properties:

| Property        | Type | Description   
| :------------- |:------------- |:-------------
| Type     | String | Type of step, default is "Regular"
| Title      | String | Title of step   
| Content | String | Step content, can incude html tags
| Selector | String | If type is set to "element" this is the selector used to find the element
| Placement | String | If type is set to "element" determines the placement of the container, default is "bottom"
| Scroll | boolean | If type is set to "element" can disable/enable scrolling to element, default is true.
| beforeStep | function | Function called before step transitions in, can pause joyride until some code executes
| afterStep | function | Function called after step transitions out, can pause joyride until some code executes

#### Step Types
There are 2 available types:
* __Regular:__ The default type, appears as a regular pop-up.
* __Element:__ Highlights a certain element in the DOM. Requires the `selector` property to work and can be positioned with the `placement` property with top, right, bottom or left.

#### Before/after step callbacks
These should be used if you want to pause between steps to execute some code first, for example opening a modal or going to a different page before going to the next step. Both these functions need to take a `resume` function  as the first paramater (you can rename it if you want) to be called when you want the joyride to resume.

In the example below the modal should be open in the second step but it should be closed in the first and third step:
````
joyride.config.steps = [
    {
      title : 'Step 1',
      content: "<p>This step is on the main page with the modal closed.</p>",
    },
    {
      type: 'element',
      selector: '.modal .button',
      title: "Step 2",
      content: "This step should wait for the modal to open first!",
      beforeStep: openModal,
      afterStep: closeModal,
      scroll: false
    },
    {
      title : 'Step 3',
      content: "<p>Last step is on the main page with the modal closed.</p>",
    }
  ];
  
  // Make sure to call resume to let the joyride know it should continue
  function openModal(resume){
    modal.open.then(function(){
        resume();
    });
  }
  
  function closeModal(resume){
    modal.close.then(function(){
        resume();
    });
  }
````

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
If you want to use your own template for the joyride then include in your html a script tag similar to the following:
````
<script type="text/ng-template" id="myCustomTemplate.html">
    /// Template Html here    
</script>
````
and in your controller set the `template` property to your template's id:
````
joyride.template = 'myCustomTemplate.html'
````

Your template must contain a div with the class `jr_container`, i would recommend copying the html of the default template and editing it, you can find the html below:
````
<script type="text/ng-template" id="myCustomTemplate.html">
  <div class="jr_container" id="jr_step_{{joyride.current}}">
    <div class="jr_step">
      <h4 ng-if="joyride.config.steps[joyride.current].title" class="jr_title">Test1 {{joyride.config.steps[joyride.current].title}}</h4>
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
</script>
````
