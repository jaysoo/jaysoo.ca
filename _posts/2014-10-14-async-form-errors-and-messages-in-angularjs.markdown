---
created_at: 2014-10-14 21:43Z
layout: post
title: Asynchronous form errors and messages in AngularJS
tags: [javascript, angular]
---

Angular 1.3.0 (superluminal-fudge) has been [released](http://angularjs.blogspot.ca/2014/10/angularjs-130-superluminal-nudge.html)!
In a [previous post]({% post_url 2014-02-27-designing-angularjs-directives %}), I presented a framework on top
of AngularJS 1.2 to handle asynchronous form validations and error message display concerns. This has been made
much easier in AngularJS 1.3!

In this post we will cover three new features:

- ngMessages
- $asyncValidators on NgModelController
- ngModelOptions

## New messaging framework

The **ngMessages** module adds two directives that are designed to show and hide messages based on the state of the object
it listens on.

Suppose that we have the following HTML.

{% highlight html %}
<div ng-init="obj = {greet: true}">
  <ng-messages for="obj">
    <ng-message when="greet">Hello World!</ng-message>
  </ng-messages>
</div>
{% endhighlight %}

This says, watch for `obj` in the scope. If `obj.greet` is `true`, then show "Hello World!".

Now, remember that **NgModelController** sets an `$error` object on itself whenever validation fails. This object
contains key-value corresponding to validators (e.g. required, maxlength, etc.), and the value is `true` whenever
the model value is invalid.

For example, a sign-up form might have a username field with the follow $errors object.

{% highlight javascript %}
$scope.signUpForm.username.$errors; // { required: true }
{% endhighlight %}

This composes very well with `ng-messages` because the output of NgModelController (`$error`) is the input of
ng-messages (`for="form.field.$error"`).

Let's take a closer look at this form.

## Error messages in forms

Suppose we have the following sign-up form.

{% highlight html %}
<form novalidate name="signUpForm" >
  <label>
    Username:
    <input type="text" ng-model="user.username" name="username" required />
  </label>

  <ng-messages for="signUpForm.username.$error" ng-if="signUpForm.username.$dirty">
    <ng-message when="required" class="error">This is required</ng-message>
  </ng-messages>

  <label>
    Password:
    <input type="password" ng-model="user.password" name="password" required />
  </label>

  <button>Sign Up</button>
</form>
{% endhighlight %}

Here, we have the **signUpForm** with a **username** field. The username field has a **required** validator.
When the required validator fails, `signUpForm.username.$error.required` is set to `true`.

And since `ng-messages` is watching the `signUpForm.username.$error` object, whenever the required validator
fails, we will see the message "This is required".

This is fine and all. But what happens when we want to perform a uniqueness check on the username? This operation
must be done asyncly because only the server would know if a username exists or not.

In comes **$asyncValidators** to the rescue!

## New validation pipeline

Angular 1.3 adds two new properties to **NgModelController**: $validators and $asyncValidators.

Both properties define a pipeline for validation to be run against a given value. This replaces
the previous validation pipeline through `ngModel.$parsers` and `ngModel.$formatters`.

For $validators, the functions return `true` if a value is valid, and `false` otherwise. And for
$asyncValidators, the functions return a **promise** that is **resolved** if a value is valid, and **rejected**
otherwise.


### Async form validations

For our form, we can define a new directive `uniqueUsername` that will be used as follows.

{% highlight html %}
<label>
  Username:
  <input type="text" ng-model="user.username" name="username"
    required
    unique-username />
</label>

<ng-messages for="signUpForm.username.$error" ng-if="signUpForm.username.$dirty">
  <ng-message when="unique" class="error">This is taken</ng-message>
  <ng-message when="required" class="error">This is required</ng-message>
</ng-messages>
{% endhighlight %}

Here, we added **unique-username** to the input, and a new ng-message when "unique" fails.

How do we implement this directive? It's actually very simple.

{% highlight javascript %}
m.directive('uniqueUsername', function(isUsernameAvailable) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$asyncValidators.unique = isUsernameAvailable;
    }
  };
});
{% endhighlight %}

Of course, I haven't implemented the `isUsernameAvailable` service yet. But it can be simply done like so.

{% highlight javascript %}
m.factory('isUsernameAvailable', function($q, $http) {
  return function(username) {
    var deferred = $q.defer();

    $http.get('/api/users/' + username).then(function() {
      // Found the user, therefore not unique.
      deferred.reject();
    }, function() {
      // User not found, therefore unique!
      deferred.resolve();
    });

    return deferred.promise;
  }
});
{% endhighlight %}

Nice! This is exactly what we needed. Both error messages and async validations are working now!

One *tiny* issue remains. Our new validator is called everytime the user types something. If the user
types five characters within a second, we just wasted five HTTP requests when one would have sufficed -- the one
being the final word.

The solution for this performance issue is our last topic.

## Debouncing model value changes

The new **ngModelOptions** directive allows us to configure the behaviour of the NgModelController. The one option
we are interested in is **debounce**.


{% highlight html %}
<input type="text" ng-model="user.username" name="username"
  ng-model-options="{ debounce: 100 }"
  required
  unique-username />
{% endhighlight %}

Here, we're defining a debounce of 100 milliseconds. This means that any parsing and validation will be delayed until
after 100 milliseconds have elapsed since the last time they've been invoked. Basically, if we type 2 characters every
100 milliseconds, we'd expect up three HTTP requests for the five-lettered word (instead of 5).

This new feature helps improve performance whenever an expensive operation is being called multiple times.

## Wrap-up and further readings

In this post, we covered how to hook form validations into the ngMessages framework. We went over async validations on
model value. And lastly, we looked at the debounce option of ngModel to optimize the number of expensive operations.

For learn more about these topics, here are some useful links.

* [AngularJS 1.3.0 announcement](http://angularjs.blogspot.ca/2014/10/angularjs-130-superluminal-nudge.html)
* [ngMessages API reference](https://docs.angularjs.org/api/ngMessages)
* [NgModelController API refernce](https://docs.angularjs.org/api/ng/type/ngModel.NgModelController)
* [ngModelOptions API reference](https://docs.angularjs.org/api/ng/directive/ngModelOptions)
* [Taming Forms in AngularJS 1.3](http://www.yearofmoo.com/2014/09/taming-forms-in-angularjs-1-3.html) (yearofmoo.com)
