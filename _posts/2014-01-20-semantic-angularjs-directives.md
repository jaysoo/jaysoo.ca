---
created_at: 2014-01-20 19:33Z
layout: post
title: Creating Semantic, Reusable Directives in AngularJS
tags: [javascript, angular, directives]
---

One of the main benefits of Angular is the ability to easily extend HTML with new behaviours through the use
of custom directives. Directives allow developers to match markers in the DOM with the intended behaviours.

In this post we'll cover:

* Why writing semantic and reusable directives is desirable.
* How to build directives on top of semantic HTML elements and attributes.
* How to provide communication between directives via controllers.
* How to provide basic animations using the `$animate` service.

This post assume you have some experience with Angular directives.

<div class="alert alert-warning">
  <strong>Warning:</strong> This post was written for AngularJS 1.4 and may contain outdated information.
  Please see <a href="http://www.codelord.net/2016/11/23/spotting-outdated-angular-1-dot-x-posts/">this post</a>
  for things to watch out for when reading older Angular posts.
</div>

## Motivation

The first question you may have is why we care about semantics when building directives. I will attempt to answer that
question with a simple example of a view switcher.

Here, we are using `ng-show` and `ng-click` to provide a view switcher between "show" and "edit" modes.

<pre>
&lt;div ng-init="mode = 'show'"&gt;
  &lt;div ng-show="mode == 'show'"&gt;
    &lt;p&gt;Hi, &#123;&#123; user.name &#125;&#125;&lt;/p&gt;
    &lt;button ng-click="mode = 'edit'"&gt;
      Edit
    &lt;/button&gt;
  &lt;/div&gt;
  &lt;div ng-show="mode == 'edit'"&gt;
    &lt;p&gt;
      &lt;input ng-model="user.name"&gt;
    &lt;/p&gt;
    &lt;button ng-click="mode = 'show'"&gt;
      Done
    &lt;/button&gt;
  &lt;/div&gt;
&lt;/div&gt;
</pre>

Wow, we've just created a view switcher without writing any JavaScript! We could be happy with this and call it a day,
but let's take a look at a few issues that I see in the preceeding example.

### 1. Unsemantic Attributes In The HTML

The three attributes, `ng-init`, `ng-show`, and `ng-click` have no semantic meaning in the HTML. While this may not
seem like a huge issue, I would argue that in a larger application semantics allow you more easily discern the
intent of the added behaviours -- in this case, view switching.

### 2. Limited Reusability Of The Component

Because our HTML is wired for a very specific use-case, it is hard to reuse the component in other contexts.
You could use `ng-include` to encapsulate the "show" and "edit" partials within the HTML, then use a controller to
provide the `templateUrl` to each includes. Doing so is fragile at best, and still prevents reuse in the case
where we have more than two modes.

Maybe we can keep going down this path and use `ng-repeat` to allow any number of views and partials, but this
might introduce more problems rather than solve existing problems. So let's move on.

### 3. Imperative vs Declarative Views

Our little HTML is imperative in that we are changing the program state (read mode) through
the expression inside the `ng-click` attribute. This is going against the spirit of Angular, which encourages
declarative programming over imperative programming.


## A Better Approach

Let's now take a look at a better potential markup for our view switcher.

<pre>
&lt;views&gt;
  &lt;view name="show" initial&gt;
    &lt;p&gt;Hi, &#123;&#123; user.name &#125;&#125;&lt;/p&gt;
    &lt;button view-target="edit"&gt;
      Edit
    &lt;/button&gt;
  &lt;/view&gt;
  &lt;view name="edit"&gt;
    &lt;p&gt;
      &lt;input ng-model="user.name" /&gt;
    &lt;/p&gt;
    &lt;button view-target="show"&gt;
      Done
    &lt;/button&gt;
  &lt;/view&gt;
&lt;/views&gt;
</pre>

From this new HTML we see that there is an outer `views` component which holds multiple child `view` components.
The `initial` attribute  of a `<view>` denotes the default, and the elements with a `view-target` attribute will
activate the view matched by `name`.

I hope the contrast between our first and second example is clear. If not, please leave a comment! :)

### Implementation Details

Let's skip ahead a bit and look at the full implementation first. (We'll go over the details right after!)

{% highlight javascript %}
var m = angular.module('views-directive', []);

// Outer views component
m.directive('views', function() {
  return {
    restrict: 'E',
    controller: function() {
      var registeredViews = {};

      this.$registerView = function(ctrl) {
        registeredViews[ctrl.$name] = ctrl;
      };

      // viewName matches the `name` attribute on &lt;view&gt;
      this.$switchTo = function(viewName) {
        for (var k in registeredViews) {
          if (k == viewName) {
            views[k].$show();
          } else {
            views[k].$hide();
          }
        }
      };
    },
    link: function(scope, element, attrs, viewsCtrl) {
      element.on('click', '[view-target]', function() {
        var viewName = angular.element(this).attr('view-target');
        viewsCtrl.$switchTo(viewName);
      });

      // Make the view controls available on the scope
      scope.$views = viewsCtrl;
    }
  };
});

// Inner view components
m.directive('view', function() {
  return {
    restrict: 'E',
    require: ['view', '^views'],
    controller: function($element, $attrs) {
      this.$name = $attrs.name;
      this.$show = function() { $element.show(); };
      this.$hide = function() { $element.hide(); };
    },
    link: function(scope, el, attrs, ctrls) {
      var viewCtrl = ctrls[0];
      var viewsCtrl = ctrls[1];

      viewsCtrl.$registerView(viewCtrl);

      if (attrs.initial !== undefined) {
        viewCtrl.$show();
      } else {
        viewCtrl.$hide();
      }
    }
  };
});
{% endhighlight %}

We've created two directives:

* `views` - outer component responsible for registration of views and switching between different views.
* `view` - inner component responsible for showing and hiding the corresponding &lt;view&gt; DOM element.

#### The Outer Directive

The controller of the outer `views` directive provides a method `$registerView` for registering a `view` controller to
itself (we'll touch on this shortly), and a method `$switchTo` for switching to a view by it's `name`.

In the link function, click events on elements decorated with the `view-target` attribute is delegated to the `$switchTo`
method of the controller. This provides the behaviour of showing a view as specified inside the HTML (and hiding all others).

The last line of the link function makes the views controller available on its scope. This is useful if we need to
programmatically switch between views inside other application controllers. For example...

{% highlight javascript %}
angular.module('my-app', []).controller('MyCtrl', function($scope, AsyncService) {
  this.submitForm = function() {
    var data = { /* ... */ };

    // Call save on an async service, then switch to 'show' on success
    AsyncService.save(data, function() {
      $scope.$views.$switchTo('show');
    });
  };
});
{% endhighlight %}

#### The Inner Directive

The `view` directive requires two controllers:

* Its own controller which performs the actual show and hide in the DOM.
* A parent `views` directive's controller to register itself with.

The link function first registers its own controller with the parent, then it checks if it is the `initial` view. If so,
it will call the `$show()` method, otherwise it calls `$hide()`.


## Bonus: Going The Distance With Animations

If you are as much of fan of `ngAnimate` as I am, you will definitely want to make your directives compatible with the
animation framework.

To make animations work, we can simply switch out the `.show()` and `.hide()` method calls in the inner `view` directive
with `$animate.addClass()` and `$animate.removeClass()`. We will also need to provide CSS animations for showing and
hiding.

JavaScript:

{% highlight javascript %}
// Must require the ngAnimate module
var m = angular.module('views-directive', ['ngAnimate']);

m.directive('view', function($animate) {
  return {
    ...
    controller: function($element, $attrs) {
      this.$name = $attrs.name;
      this.$show = function() {
        $animate.removeClass($element, 'view-hide');
      }
      this.$hide = function() {
        $animate.addClass($element, 'view-hide');
      }
    }
    ...
  };
});
{% endhighlight %}

CSS:

    views { position: relative; }

    view {
      position: absolute;
      top: 0;
      width: 500px;
    }

    view.view-hide { display: none; }

    view.view-hide-remove, view.view-hide-add { display: block !important; }

    view.view-hide-add {
      animation: .3s hide;
      -webkit-animation: .3s hide;
    }

    @keyframes hide {
      from { opacity:1; }
      to { opacity:0; }
    }

    @-webkit-keyframes hide {
      from { opacity:1; }
      to { opacity:0; }
    }

    view.view-hide-remove {
      animation: .3s show;
      -webkit-animation: .3s show;
    }

    @keyframes show {
      from { opacity:0; }
      to { opacity:1; }
    }

    @-webkit-keyframes show {
      from { opacity:0; }
      to { opacity:1; }
    }

With very little JavaScript changes, and a bit of CSS we've just added animations to our directive!

The full example can be found on [Plunker](http://embed.plnkr.co/N5Sj7gMg9bpCTFtPBXV9/preview).


## Wrap-Up, Future-Proofing Your Components

We've learned how to extend HTML through the use of Angular directives. You may notice that the final HTML of our
component contains almost no Angular (with the exception of `ng-model`). This fits very well with AngularJS 2.0's goal
of integrating with [Web Components](http://w3c.github.io/webcomponents/spec/custom/) and other frameworks, such as
[Polymer](http://www.polymer-project.org/).

Also note that our final solution allows us to use an arbitrary number of views within our HTML without any hassle!

    <views>
        <ul>
          <li><a view-target="foo">Foo</a></li>
          <li><a view-target="bar">Bar</a></li>
          <li><a view-target="faz">Faz</a></li>
          <li><a view-target="baz">Baz</a></li>
        </ul>
        <view name="foo" initial>...</view>
        <view name="bar">...</view>
        <view name="faz">...</view>
        <view name="baz">...</view>
    </views>

Please keep in mind that the examples shown here are not production-ready, and are missing a lot of pieces, such
cleaning up on scope's `$destroy` event.

I've touched a little bit on animations in Angular. If you want to learn more, please do read
[Year of Moo's post on animations in AngularJS 2.0](http://www.yearofmoo.com/2013/08/remastered-animation-in-angularjs-1-2.html),
and also refer to the official [$animate docs](http://docs.angularjs.org/api/ngAnimate.$animate).

