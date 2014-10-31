---
created_at: 2014-10-31 21:44Z
layout: post
title: JavaScript Function Redux (+ ES6!)
tags: [javascript, es6]
---

JavaScript functions can be confusing sometimes. There are many ways to define
them and many ways to invoke them. Throw in `this`, and things really starts to
get fun.

In this post we will revisit plain-old functions in JavaScript. The different
ways we can invoke them, and what `this` is within the body. We'll go over the
new **arrow functions** and their differences in behaviour from ordinary
functions.

At the end of this post we'll cover some gotchas when using arrow functions.

## Revisiting functions

Let's review function declarations, how `this` can be affected by different
invocation methods, and the `.bind()` method. 

If you are already familiar with these topics, feel free to jump to the [ES6 arrow
function section](#arrow-functions)

### Function definition

In JavaScript, you can define a function through either a **function declaration**
or a **function expression**.

{% highlight javascript %}
function f() {} // declaration
var g = function () {}; // expression and assignment
{% endhighlight %}

For the purposes of this post, we won't go over the differences between the two.
(That can be a future topic)

### What is this?

The `this` in a function depends on how it is defined, and how it is invoked.

Take this function for example.

{% highlight javascript %}
function f(b) {
  return this.a + b;
}
{% endhighlight %}

You can call it in the following ways.

{% highlight javascript %}
f(1); // window.a + b = undefined + 1 = NaN
f.apply({a: 1}, [2]); // this.a + b = 1 + 2 = 3
f.call({a: 1}, 2); // this.a + b = 1 + 2 = 3
{% endhighlight %}

If you use a direct function invocation `f(1)`, then `this` is either **window**
or **undefined** (in strict mode).

When `f.apply()` and `f.call()` are used, then `this` refers to the object passed
as the first argument.


### Object method

You can also use functions as object methods. In this case, `this` refers to
the object instance.

{% highlight javascript %}
var obj = { a: 10, f: function(b) { return this.a + b; } };
obj.f(1); // this.a + 1 = 10 + 1 = 11
{% endhighlight %}

Yet, `this` can still be changed using `.apply()` and `.call()`.

{% highlight javascript %}
obj.f.apply({a: 1}, [2]); // 3
obj.f.call({a: 1}, 2); // 3
{% endhighlight %}

### Using .bind(…)

Another way we can change the `this` of a function is through `.bind(…)`, which
returns a new function with the same body, but binds `this` to the new object.

{% highlight javascript %}
var g = f.bind({a: 100});
g(1); // 101
{% endhighlight %}

This `this` cannot be changed through `.apply()` and `.call()`.

{% highlight javascript %}
g.apply({a: 1}, [1]); // 101
g.call({a: 1}, 1); // 101
{% endhighlight %}

Nor through method call.

{% highlight javascript %}
obj = { g: g };
obj.g(1); // 101
{% endhighlight %}


## Arrow functions

ES6 introduces the new arrow function.

{% highlight javascript %}
var k = (x) => { return x };
var k = x => x; // same thing but shorter
{% endhighlight %}

The interesting thing about arrow functions is that `this` is always bound to
the context in which it was defined. This is useful when using it as callbacks
when object methods.

{% highlight javascript %}
class TodosView {
  todos: [],
  initialize() {
    fetch('/todos.json').then((response) => {
      this.todos = response.json();
      this.render();
    });
  },
  render() { /* Do something with this.todos */ }
};
{% endhighlight %}

Because the success arrow function is declared in the scope of `initialize()`,
it takes on the same `this`, which is of course the `TodosView` instance.

If this were done with normal `function`, then `this` would have been something
else (maybe `window` or `undefined`). Without the arrow function, we'd have to
resort to this.

{% highlight javascript %}
initialize() {
  var self = this;

  fetch('/todos.json').then(function() {
    self.todos = response.json();
    self.render();
  });
}
{% endhighlight %}

Or this.

{% highlight javascript %}
initialize() {
  fetch('/todos.json').then((function() {
    this.todos = response.json();
    this.render();
  }).bind(this));
}
{% endhighlight %}

### What is this?

Since `this` is always bound to the context in which the function is closed under,
you can never rebind to anything else.

{% highlight javascript %}
window.who = 'Bob';

var h = () => this.who;

h(); // 'Bob'
h.apply({who: 'Alice'}); // 'Bob'
h.call({who: 'Fred'}); // 'Bob'
h.bind({who: 'Mary'})(); // 'Bob'

var obj = { who: 'Sue', h };
obj.h(); // 'Bob'
{% endhighlight %}

### Never use arrow functions as methods

A corollary of this binding property is that arrow functions should not be
used as object methods. This is because `this` will not refer to the object
instance as you would expect it to.

{% highlight javascript %}
var obj = {
  a: 1,

  // BAD
  f: (b) => {
    return this.a + b;
  }
};
{% endhighlight %}

Again, if you feel like using arrow functions as methods, *don't*! Use 
**function short form** instead.

{% highlight javascript %}
var obj = {
  a: 1,

  // GOOD
  f(b) {
    return this.a + b;
  }
};
{% endhighlight %}

## The new operator

I left out one more way a function can be invoked: the `new` operator. The
`this` in a constructor function is the newly created instance.

{% highlight javascript %}
function F() {
  this.greeting = 'Hello!';
}

new F().greeting; // 'Hello!'
{% endhighlight %}

If you try the same with an arrow function, `this` is still whatever it was
during declaration.

{% highlight javascript %}
var G = () => {
  this.greeting = 'Hello!';
};

new G().greeting; // undefined
window.greeting; // 'Hello!'
{% endhighlight %}

So if you feel inclined to new an arrow function for some reason, *don't*! Use
normal functions or classes instead.

{% highlight javascript %}
function G() {
  this.greeting = 'Hello';
}

class G {
  constructor() {
    this.greeting = 'Hello';
  }
}
{% endhighlight %}

## To sum it up

There are many ways to define and use functions in JavaScript. With ES6 we have
even more options open to us. It's important to know what to use in specific
situations, and why. And remember, **never** use arrow functions  as object
methods!
