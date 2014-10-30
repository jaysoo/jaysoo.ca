---
created_at: 2014-10-30 21:44Z
layout: post
title: JavaScript Function Redux (+ ES6!)
tags: [javascript, es6]
---

In JavaScript, you can define a function through either a **function declaration**
or a **function expression**.

{% highlight javascript %}
function f() {} // declaration

var g = function () {}; // expression and assignment
{% endhighlight %}

With ES6 comes the new arrow function.

{% highlight javascript %}
var h = x => x;
var h = (x) => { return x };
{% endhighlight %}

The `this` in a function depends on how it is defined, and how it is called.

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

You can also use it as a method, which will bind `this` to the object.

{% highlight javascript %}
var obj = { a: 10, f: f }
obj.f(1); // this.a + 1 = 10 + 1 = 11
{% endhighlight %}

Yet, its `this` can still be changed using `.apply()` and `.call()`.

{% highlight javascript %}
obj.f.apply({a: 1}, [2]); // 3
obj.f.call({a: 1}, 2); // 3
{% endhighlight %}

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

Back to **arrow functions**, they cannot be rebound in anyway whatsoever!

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

If you feel like using arrow functions as methods, *don't*! Use the **function
short form** instead.

{% highlight javascript %}
var obj = {
  a: 1,

  // GOOD
  f(b) {
    return this.a + b;
  },

  // BAD
  g: (b) => {
    return this.a + b;
  }
}
{% endhighlight %}

BTW, I left out one more way a function can be invoked: the `new` operator. The
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


So why the different behaviour in arrow functions? Why bother with them at all?

{% highlight javascript %}
class TodosView {
  todos: [],

  initialize() {
    fetch('/todos.json').then((response) => {
      this.todos = response.json();
      this.render();
    });
  },

  render() {
    // Do something with this.todos
  }
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
  fetch('/todos.json').then(function() {
    this.todos = response.json();
    this.render();
  }.bind(this));
}
{% endhighlight %}

And arrow functions just make your code look more awesome!

{% highlight javascript %}
var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var isEven = x => x % 2 === 0;
numbers.filter(isEven); // [2, 4, 6, 8, 10]

var square = x => x * x;
numbers.map(square); // [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

var dot = prop => obj => obj[prop];
dot('x')({ x: 1 }); // 1
{% endhighlight %}
