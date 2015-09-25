---
created_at: 2015-09-25 15:20Z
layout: post
title: Typed Redux and React
tags: [javascript,react,flux,redux]
---

The recent release of [TypeSciprt](http://www.typescriptlang.org/) (TS) 1.6 includes support [React](http://facebook.github.io/react/) components.
I decided to give it a whirl and see what TS has to offer.

The end result is a port of the [Redux](https://github.com/rackt/redux) [TodoMVC](http://todomvc.com/) example to TS..

So why types in the first place? Isn't the dynamic and flexible nature of JavaScript what makes it so great in the first
place? As strange as it sounds, I actually believe that adding more constraints to the system can result in *more* freedom.
Of course, the type system has to be powerful and flexible enough to not get in your way every step of the way.

This post is meant for developers who work with JavaScript and has an interest in TS and React. I will be showing
examples using the Redux framework, but it is not a requirement. No prior knowledge of TS is required, but you should have
some familiarity with React.

I will cover the following topics:

- What are types, and why we need them?
- How does a typed React application look like?
- Additional considerations when choosing TS and React.

## Types are good for you

If you have any Java experience, you may be immediately turned off by types. The first thing to know if that a type is
not a class. In a more FP definition, a type is a name given to the set of input and output of a given function. That is,
a type describes a the interface of a function.

Say I have a function defined as follows:

{% highlight js %}
const add = (a: number, b: number): number => a + b;
{% endhighlight %}

This the TS syntax that says my `add` function takes in two parameters `a` and `b` both of type `number`, then outputs
a `number`. Thus, if I write any of the following statements, I will get a static type error.

{% highlight js %}
add(1, '2'); // '2' is not a number

const result: string = add(1, 2); // result declared to be string, but add returns a number.
{% endhighlight %}
