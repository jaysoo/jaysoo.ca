---
created_at: 2014-10-14 21:43Z
layout: post
title: Angular Messages and Async Validation
tags: [javascript, angular]
---

Angular 1.3.0 (superluminal-fudge) has been [released](http://angularjs.blogspot.ca/2014/10/angularjs-130-superluminal-nudge.html)!

In a [previous post](http://jaysoo.ca/2014/02/27/designing-angularjs-directives/), I presented a framework on top
of AngularJS 1.2 that handles error messages, and supports error messages for async validations. This has been much
easier in AngularJS 1.3.

In this post we will cover three new features:

- ngMessages
- $asyncValidators on NgModelController
- ngModelOptions

## ngMessages

The `ngMessages` module adds two directives that are designed to show and hide messages based on the state of the object
it listens on.

Suppose that we have the following HTML.

{% highlight html %}
<ng-messages for="messages" ng-init="messages = {foo: true}">
  <ng-message when="foo">Boo-urns</ng-message>
</ng-messages>
{% endhighlight %}
