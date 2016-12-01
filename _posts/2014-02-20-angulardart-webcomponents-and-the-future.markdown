---
created_at: 2014-02-20 20:22Z
layout: post
title: AngularDart, Web Components, and the Future
tags: [javascript, angular, dart]
---

**AngularJS** has been instrumental in changing the way I develop web applications. From building imperative views where
both business logic and user interaction live, to separate controllers and directives that handle both requirements
respectively. From sharing components through jQuery plugins, the usual common denominator, to sharing components
through declarative HTML. From reacting to model changes through events, to wiring up the HTML to react to model
changes. The list goes on.

This post is intended for:

- AngularJS developers
- Developers that enjoy learning about new web technologies

<div class="alert alert-warning">
  <strong>Warning:</strong> This post was written for AngularJS 1.4 and may contain outdated information.
  Please see <a href="http://www.codelord.net/2016/11/23/spotting-outdated-angular-1-dot-x-posts/">this post</a>
  for things to watch out for when reading older Angular posts. If you would like me to update the content of this post,
  please ping me on Twitter at <a href="https://twitter.com/jay_soo">@jay_soo</a>. If there are enough interest, I might
  make an update.
</div>

## Overview

As much joy as I've derived from developing with AngularJS, there are a few bumps. Firstly, I may have a
component written as a nice directive in AngularJS, but I cannot use it in projects that aren't built in AngularJS. In
these cases, the default fallback is still jQuery. Secondly, even though I absolutely love working in JavaScript, the
version that I and most developers have to work with is greatly outdated -- ES3.

As a pragmatist, I have dabbled with CoffeeScript in a number of projects. It provides a cleaner syntax, a few
useful abstractions (assignment destructuring, list comprehensions, etc.), but there isn't anything ground breaking
about it.

In comes **Dart** and **AngularDart**, a port of AngularJS in Dart. AngularDart is really a re-implementation rather
than a port of AngularJS. Free of all the baggage of JavaScript, legacy browsers, and backward compatibility of
AngularJS 1.x, the Angular team has done a superb job of creating a MV* framework that is far more user-friendly and
forward-looking.

I've shyed away from Dart for the longest time because it felt very Java-esque, and there wasn't much practicality in
using it for a real product due to its lack of legacy browser support. However, after using Dart for a bit, I realized
that although Dart and Java share similar syntax, that's where the commonality ends. You still have a
dynamically-typed language, with optional type declarations. All of "The Bad Parts" of JavaScript are gone, and you
are left with the good parts, so to speak.

Legacy browsers are still important for businesses that need to support them. This should not, however, discourage us
from looking to the future with optimism. There are some really cool stuff that will become commonplace sooner rather
than later.

## Where is this all heading

There are far more users of AngularJS than AngularDart. This is not a bad thing, just a fact. I can't say for certain
whether I'll be developing something in AngularDart five years from now. I can say with a much greater certainty that
I will be developing something in ES6/7, using web components, and whatever cool, new web technology we'll have in the
future.

This is where I think the real value of AngularDart comes in. The way we are developing applications in AngularJS 1.x
is not where the web is moving towards. Web components will become the new common denominator. There are already
projects like Polymer and Mozilla Brick that leverage this new power of the web. The powerful, but slightly confusing
AngularJS 1.x directives will be gone, and we'll be left with much cleaner Controllers, Directives, and Components.

## AngularDart and AngularJS 2.0

I mentioned controllers, directives, and components. The first two will be familiar to any AngularJS developers, but
components are completely new to AngularDart. Here are the use cases for each of them.

1. Controllers contain business logic and do not do any DOM manipulations.
2. Directives are used to introduce new behaviour to existing HTML in a declarative fashion.
3. Components are used for custom elements and uses the shadow DOM -- think web components.

The nice thing about AngularDart is that the API for all three are essentially the same.

{% highlight dart %}
@NgController(selector: '[my-controller]')
class MyController {
  // ...
}

@NgDirective(selector: '[my-directive]')
class MyDirective {
  // ...
}

@NgComponent(selector: '[my-component]')
class MyComponent {
  // ...
}
{% endhighlight %}

The main difference here is that each one is decorated with a different annotation (`@NgController`, `@NgDirective`,
and `@NgComponent`). Another difference is that controllers and components create a new scope, whereas directives
do not.

The `selector` option is a CSS selector to match elements in the DOM. This greatly simplifies the existing directive
API which uses a combination of the name and `restrict` option.

{% highlight javascript %}
m.directive('myDirective', function() {
  return {
    restrict: 'A',
    link: function() { /* ... */ }
  };
});
{% endhighlight %}

This allows us to build our application using an unified API, rather than having to build controllers and directives
in completely different manners.

More importantly, AngularJS 2.0 is drawing a lot of inspiration from AngularDart, and many of the APIs will be changed
in the future to mimic the same ones in AngularDart. Now is as good a time as any to familiarize yourself with these
changes if you are already using AngularJS.

This is just the tip of the iceberg of AngularDart. Other major changes/additions are **[Zones](https://github.com/btford/zone.js/)**
and the **[DI framework](https://github.com/angular/di.js)**. With zones developers will no longer need to call
`scope.$apply()`, which I am sure will make everyone very happy.

### A little bit more on zones

Okay, zones are *amazing*. From the [Dart API Reference](https://api.dartlang.org/apidocs/channels/stable/#dart-async.Zone):

<blockquote>
A Zone represents the asynchronous version of a dynamic extent. Asynchronous callbacks are executed in the zone they
have been queued in.
</blockquote>

What it means, basically, is that async operations that pushes execution to the next tick (in the run loop) will still
take place in the same "zone." This way, Angular will be able to digest any bound value changes without you calling
`scope.$apply()` manually.

For example, in the current AngularJS this code will present a problem.

{% highlight javascript %}
function MyCtrl($scope) {
  $scope.message = "Hello";

  setTimeout(function () {
    // AngularJS unaware of $scope changes
    $scope.message = "World!";
  }, 1000);
}
{% endhighlight %}

To fix it, we must call `scope.$apply()` within the function passed to `setTimeout`.

With zones, however, Angular will be able to detect these changes because the `setTimeout` call occur within the same zone.

## More on web components

Back to components. Can we all agree that web components are *awesome*? Imagine a future where we can all share our
custom elements no matter which MV* framework we are using.

The fundamental difference in building web components versus AngularJS directives or jQuery plugins is that they allow
us to encapsulate HTML and CSS in a way that is not currently possible. This prevents leaky abstractions where we need
to understand the underlying markup and styling in order to use a component.

For example, say we want to include slideshow in our application. If you use a jQuery plugin, you will have to
construct the HTML in a way that the plugin understands.

{% highlight html %}
<div class="carousel">
  <ul>
    <li>
      <img src="photo1.jpg" />
      <span class="caption">This is the first photo</span>
    </li>
    <li>
      <img src="photo2.jpg" />
      <span class="caption">This is the second photo</span>
    </li>
    <li>
      <img src="photo3.jpg" />
      <span class="caption">This is the third photo</span>
    </li>
  </ul>
  <a href="#" class="carousel-control-prev">Prev</a>
  <a href="#" class="carousel-control-next">Next</a>
</div>
{% endhighlight %}

Here we need to include the right classes in order for the plugin to pick up the correct element to instantiate the
carousel, controls, and apply styling.

Now take a look at a hypothetical custom element.

{% highlight html %}
<carousel>
  <slide caption="This is the first photo">
    <img src="photo1.jpg" />
  </slide>
  <slide caption="This is the second photo">
    <img src="photo2.jpg" />
  </slide>
  <slide caption="This is the third photo">
    <img src="photo3.jpg" />
  </slide>
</carousel>
{% endhighlight %}

The second HTML is much cleaner, and as a bonus we wouldn't need to include extra stylesheets because the CSS is
encapsulated with the component.

This is the way AngularDart components work, and in the future probably AngularJS as well. Moreover, we should be
able to use components that are not built in Angular.

## Wrap-up

I think it's worthwhile to learn AngularDart now, even if you don't plan on moving any projects to it. There are major
API overhauls and changes to the framework that will eventually come to AngularJS.

Just as AngularJS changed my way of developing web applications, so will AngularDart help us, once again, rethink the
way we build and structure our applications.

## Further information

- [AngularDart for AngularJS developers](http://victorsavkin.com/post/72452331552/angulardart-for-angularjs-developers-introduction-to)
- [Official AngularDart website](https://angulardart.org/)
- [Zone.js](https://github.com/btford/zone.js/)
- [DI.js](https://github.com/angular/di.js)
