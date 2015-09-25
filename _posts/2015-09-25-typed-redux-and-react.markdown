---
created_at: 2015-09-25 15:20Z
layout: post
title: Typed Redux and React
tags: [javascript,react,flux,redux]
---

The recent release of [TypeSciprt](http://www.typescriptlang.org/) (TS) 1.6 includes support [React](http://facebook.github.io/react/) components.
I decided to give it a whirl and see what TS has to offer.

The end result is a port of the [redux](https://github.com/rackt/redux) [TodoMVC](http://todomvc.com/) example to TS.

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
// '2' is not a number
add(1, '2');

// result declared to be string, but add returns a number.
const result: string = add(1, 2);
{% endhighlight %}

Not only do you get compile errors, if you are using an IDE that supports TS you will actuall get editor hints are you
are typing.

![](/images/ts-ide-1.gif)

### Types are not classes

As mentioned before, types in TS are not classes. The following defines a `Todo` type, but does not create a class.

{% highlight js %}
type Todo = {
  id?: number;
  text: string;
  completed: boolean;
}
{% endhighlight %}

The `id?` syntax means that the `id` property is optional (since a new `Todo` may not have an ID yet).

Given the above definition, I can now do the following.

{% highlight js %}
// Valid assignment
const t1: Todo = {
  id: 1,
  text: 'Finish this blog post',
  completed: false
};

// Type error because text is missing
const t2: Todo = {
  id: 2,
  completed: false
};
{% endhighlight %}

What is more interesting is that I can use the type to form an interface over functions that operate over `Todo`s.

{% highlight js %}
const completedTodos = (todos: Todo[]): Todo[] => {
  return todos.filter(t => t.completed);
};

// This works
completedTodos([
  { id: 1, text: 'Do something', completed: true },
  { id: 2, text: 'Do another thing', completed: false }
]);

// These fail because inputs are the wrong type
completedTodos('Huh?');
completedTodos([{ text: 'Missing completed property' }]);
{% endhighlight %}

Again, you will see errors in IDEs that support TS as you are typing.

You can even define types for functions.

{% highlight js %}
type F = (x: number) => string;

const f: F = (x: number): string => `Number: ${x}`;
{% endhighlight %}
