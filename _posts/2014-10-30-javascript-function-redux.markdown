---
created_at: 2014-10-30 21:44Z
layout: post
title: JavaScript Function Redux (+ ES6!)
tags: [javascript, es6]
---

JavaScript functions can be confusing sometimes. There are many ways to define
them and many ways to invoke them. Throw in `this`, and things really starts to
get fun.

In this post, we will re-examine plain-old functions in JavaScript. We'll also
introduce the new **arrow function** that is coming in ES6, and how their
behaviour differs from traditional functions.

## Defining a function

In JavaScript, you can define a function through either a **function declaration**
or a **function expression**.

```javascript
function f() {} // declaration

var g = function () {}; // expression and assignment
```

## What is `this`?

The `this` in a function depends on how it is defined, and how it is called.

Take this function for example.

```javascript
function f(b) {
  return this.a + b;
}
```

You can call it in the following ways.

```javascript
f(1); // window.a + b = undefined + 1 = NaN
f.apply({a: 1}, [2]); // this.a + b = 1 + 2 = 3
f.call({a: 1}, 2); // this.a + b = 1 + 2 = 3
```

You can also use it as a method, which will bind `this` to the object.

```javascript
var obj = { a: 10, f: f }
obj.f(1); // this.a + 1 = 10 + 1 = 11
```

Yet, its `this` can still be changed using `.apply()` and `.call()`.

```javascript
obj.f.apply({a: 1}, [2]); // 3
obj.f.call({a: 1}, 2); // 3
```

Another way we can change the `this` of a function is through `.bind(…)`, which
returns a new function with the same body, but binds `this` to the new object.

```javascript
var g = f.bind({a: 100});
g(1); // 101
```

This `this` cannot be changed through `.apply()` and `.call()`.

```javascript
g.apply({a: 1}, [1]); // 101
g.call({a: 1}, 1); // 101
```

Nor through method call.

```javascript
obj = { g: g };
obj.g(1); // 101
```

## Arrow functions

With ES6 comes the new arrow function.

```javascript
var h = x => x;
var h = (x) => { return x };
```

```javascript
window.who = 'Bob';

var h = () => this.who;

h(); // 'Bob'
h.apply({who: 'Alice'}); // 'Bob'
h.call({who: 'Fred'}); // 'Bob'
h.bind({who: 'Mary'})(); // 'Bob'

var obj = { who: 'Sue', h };
obj.h(); // 'Bob'
```

If you feel like using arrow functions as methods, *don't*! Use the **function
short form** instead.

```javascript
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
```

BTW, I left out one more way a function can be invoked: the `new` operator. The
`this` in a constructor function is the newly created instance.

```javascript
function F() {
  this.greeting = 'Hello!';
}

new F().greeting; // 'Hello!'
```

If you try the same with an arrow function, `this` is still whatever it was
during declaration.

```javascript
var G = () => {
  this.greeting = 'Hello!';
};

new G().greeting; // undefined
window.greeting; // 'Hello!'
```

So why the different behaviour in arrow functions? Why bother with them at all?

```javascript
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
```

Because the success arrow function is declared in the scope of `initialize()`,
it takes on the same `this`, which is of course the `TodosView` instance.

If this were done with normal `function`, then `this` would have been something
else (maybe `window` or `undefined`). Without the arrow function, we'd have to
resort to this.


```javascript
initialize() {
  var self = this;

  fetch('/todos.json').then(function() {
    self.todos = response.json();
    self.render();
  });
}
```

Or this.

```javascript
initialize() {
  fetch('/todos.json').then((function() {
    this.todos = response.json();
    this.render();
  }).bind(this));
}
```

And arrow functions just make your code look more awesome!

```javascript
var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var isEven = x => x % 2 === 0;
numbers.filter(isEven); // [2, 4, 6, 8, 10]

var square = x => x * x;
numbers.map(square); // [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

var dot = prop => obj => obj[prop];
dot('x')({ x: 1 }); // 1
```
