# angular-joyride

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
  
  joyride.steps = [
    {
      title: "Title 2",
      content: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus, quidem, quia mollitia harum tempora laudantium deserunt deleniti. Expedita, soluta, atque maxime minus commodi quaerat ipsum reiciendis veritatis eum laboriosam incidunt.</p><p>another example</p>'
    },
    {
      type: 'element',
      selector: "h1",
      title: "Title 1",
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus, quidem, quia mollitia harum tempora laudantium deserunt deleniti. Expedita, soluta, atque maxime minus commodi quaerat ipsum reiciendis veritatis eum laboriosam incidunt.',
      placement: 'bottom'
    }
  ]
});
````

##### Starting the joyride
The `start` property can be used to trigger the joyride, setting it to `true` starts the joyride and `false` will end it.

### Joyride Steps
The `steps` property accepts an array containing the steps of the joyride, each step should be an object with the following properties:

| Property        | Description           
| :------------- |:-------------
| Type     | Type of step, default is "Regular"
| Title      | Title of step   
| Content | Step content, can incude html tags
| Selector | If type is set to "element" this is the selector used to find the element
| Placement | If type is set to "element" determines the placement of the container, default is "bottom"


#### Step Types
There are 3 available types:
* __Regular:__ The default type, appears as a regular pop-up.
* __Element:__ Highlights a certain element in the DOM. Requires the `selector` property to work and can be positioned with the `placement` property with top, right, bottom or left.
* __Function__: Can be used to open a modal or change the page between steps. When using this you have to change to the next step manually using the `next()` method. Example:
````
var joyride = joyrideService;
joyride.steps = [
  {
    title : 'Step 1',
    content: "<p>This is the first step</p>",
  },
  {
    type: 'function',
    function: openModal
  },
  {
    title: 'Step 2',
    content: '<p>Modal has been opened!</p>'
  },
]

function openModal(){
    // Open Modal Here

    // After modal opens change to the next step
    joyride.next();
}
````
## Methods
| Method        | Description           
| :------------- |:-------------
| next     | Goes to the next step 
| prev      | Goes to the previous step
| goTo | Goes to a specific step, requires a number representing the index of the step     

## Events
| Event        | Description           
| :------------- |:-------------
| afterChangeStep | Function called after step change
| onStart | Function called when joyride starts
| onFinish | Function called when joyride ends
__Usage:__
````
joyride.afterChangeStep = function(){
    // Do something
}
````

## Animations
This directive relies on `ngAnimate` and the [$animate](https://docs.angularjs.org/api/ng/service/$animate) service for handling animation classes. By default the joyride has simple fade in/out animations, but you can customize them by using the `.jr-start` class for start/end animations and the `.jr-transition` for step transition animations:
````
.jr-container{
    transition: opacity 0.3s, transform 0.3s
}

//////// START/END ANIMATIONS
.jr-container.jr-start-add {
  opacity: 0;
}
.jr-container.jr-start-add-active {
  opacity: 1;
}

.jr-container.jr-start-remove {
  opacity: 1;
}
.jr-container.jr-start-remove-active {
  opacity: 0;
}
//////////// STEP TRANSITION ANIMATIONS
.jr-container.jr-transition{
  opacity: 0;
}
.jr-container.jr-transition-add {
  opacity: 1;
  transform: translateY(0px);
}
.jr-container.jr-transition-add-active {
    opacity: 0;
    transform: translateY(-100px);
}

.jr-container.jr-transition-remove {
    opacity: 0;
    transform: translateY(-100px);
}

.jr-container.jr-transition-remove-active {
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

Your template must contain a div with the class `jr-container`, i would recommend copying the html of the default template and editing it, you can find the html below:
````
<div class="jr-container" id="jr-step-{{joyride.current}}">
  <div class="jr-step">
    <h4 ng-if="joyride.steps[joyride.current].title" class="jr-title">Test1 {{joyride.steps[joyride.current].title}}</h4>
    <div ng-if="joyride.steps[joyride.current].content" class="jr-content" ng-bind-html="joyride.steps[joyride.current].content | jr_trust"></div>
  </div>
  <div class="jr-buttons">
    <div class="jr-left-buttons">
      <a class="jr-button jr-skip" ng-click="joyride.start = false">Skip</a>
    </div>

    <div class="jr-right-buttons">
      <a class="jr-button jr-prev" ng-click="joyride.prev()" ng-class="{'disabled' : joyride.current === 0}">Prev</a>
      <a class="jr-button jr-next" ng-click="joyride.next()" ng-bind="(joyride.current == joyride.steps.length-1) ? 'Finish' : 'Next'"></a>
    </div>
  </div>
</div>
````
