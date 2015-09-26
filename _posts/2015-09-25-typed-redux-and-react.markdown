---
created_at: 2015-09-25 15:20Z
layout: post
title: Typed React and Redux
tags: [javascript,react,flux,redux]
---

The release of [TypeSciprt](http://www.typescriptlang.org/) 1.6 includes support [React](http://facebook.github.io/react/) components.
I decided to give it a whirl and see what TypeScript has to offer.

The end result is a port of the [Redux](https://github.com/rackt/redux) [TodoMVC](http://todomvc.com/) example to TypeScript. 
(See [my repo on GitHub](https://github.com/jaysoo/todomvc-redux-react-typescript))

So why use types in the first place? Isn't the dynamic and flexible nature of JavaScript what makes it so great in the first
place? As strange as it sounds, I actually believe that adding more constraints to the system can result in *more* freedom.
Of course, the type system has to be powerful and flexible enough to not get in your way.

This post is meant for developers who work with JavaScript and has an interest in TypeScript and React. I will be showing
examples using the Redux framework, but it is not a requirement. No prior knowledge of TypeScript is required, but you should have
some familiarity with React.

I will cover the following topics:

- What are types, and why we need them?
- How TypeScript can help us develop React applications.
- Additional considerations when choosing TypeScript and React.

**Disclosure:** I'm not an expert in TypeScript. If you have any suggestions for improvement, please leave a comment!

## Types are good for you

If you have experience in  Java (or in a similar statically typed language), you may be immediately turned off by types.
The first thing to note is that a type in TypeScript is not a class. A more mathematical definition of a type is that a
type is a name given to the set of input and output of a given function. That is, a type describes the interface of a function.
This is the way I think about types.

Say I have a function defined as follows:

{% highlight js %}
const add = (a: number, b: number): number => a + b;
{% endhighlight %}

The `add` function above says that it takes in two parameters `a` and `b` both of type `number`, then outputs
a `number`. Thus, if I write any of the following statements, I will get a compile error.

{% highlight js %}
// '2' is not a number
add(1, '2');

// result declared to be string, but add returns a number.
const result: string = add(1, 2);
{% endhighlight %}

If you are using an IDE that supports TypeScript you will get editor hints as you are typing.

![](/images/ts-ide-1.gif)

As seen above, types gives us two benefits.

1. **Catch errors early on** during compile time, not run time.
2. Serves as **documentation** for functions. And in editors that support TypeScript, we get **type hints as we code**.

Expanding on point #2, the type hints are especially useful for options object, as seen in libraries like jQuery.

Say I have this function defined below.

{% highlight js %}
const doSomething = (x: number | string | CustomClass, options?: Options): void => {
  // ...
};
{% endhighlight %}

As a user of `doSomething` I might wonder what options I am allowed to pass in. With the `Options` type defined
below, I will get hints in our editor as I code.

{% highlight js %}
type Options = {
  flag1?: boolean;
  flag2?: boolean;
  callback?: (c: CustomClass) => void;
};
{% endhighlight %}

![](/images/ts-ide-2.png)


### More on types

Before we move on to React examples, I want to expand on types a bit more.

As mentioned earlier, types in TypeScript are not classes. The following defines a `Todo` type, but does not create a class.

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

What is more interesting is that I can use the type to form an interface over a function that operate over `Todo`s.

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

Again, you will see errors in editors that support TypeScript as you are typing.

#### Function types

You can even define types for functions.

{% highlight js %}
type NumberToString = (x: number) => string;

const applyNumberToString = (f: NumberToString, x: number): string => {
  return f(x);
};
{% endhighlight %}


#### Union types and type guards

The last thing I will show is union types. A variable of an union type can be assign any type within that union.

{% highlight js %}
type numberOrString = number | string;

let x: numberOrString;

x = 1;    // OK
x = '1';  // OK
x = true; // BAD
{% endhighlight %}

Notice that there are no interfaces or subclasses defined above for `numberOrString`. Union types can be combined with type
guards to help manage branches within a function.

{% highlight js %}
const doubleIfNumber = (x: numberOrString): numberOrString => {
  if (typeof x === 'number') {
    return x * 2; // This is OK because we know x is a number!
  } else {
    return x;
  }
}

doubleIfNumber(2);   // 4
doubleIfNumber('2'); // '2'
{% endhighlight %}

The above features are enough for us to jump into the TodoMVC application. If you want to learn more about TypeScript,
I found the [Handbook](http://www.typescriptlang.org/Handbook) to be a useful resource.

## TodoMVC in React, Redux, and TypeScript

By now you have seen some of the benefits of using a powerful type system. But how does this fit in with React?

With TypeScript 1.6, you can now write your React components in TSX files. The following is an example from my [TodoMVC
example](https://github.com/jaysoo/todomvc-redux-react-typescript).

{% highlight js %}
/// <reference path='../../typings/react/react.d.ts'/>
import * as React from 'react';

interface TodoTextInputProps {
  onSave: Function;
  text?: string;
  placeholder?: string,
  editing?: boolean;
  newTodo?: boolean;
}

// This component's props have to match TodoTextInputProps inferface.
// We can do the same for the component's state. In this example, it is set to any.
class TodoTextInput extends React.Component<TodoTextInputProps, any> {
  render() {
    // ...
  }
}
{% endhighlight %}

<div class="alert alert-info">
  <strong>Note:</strong> The <code>reference</code> comment at the top points to type definitions for React. When using
  JavaScript modules in TypeScript, you must provide its type definitions. You can either write these yourself, or the better
  option is to use <a href="http://definitelytyped.org/tsd/">TSD</a> to install definitions of popular JavaScript
  modules.
</div>

### Props interface vs React.PropTypes

Props interface differs from `React.PropTypes` in that the latter will only give you errors during runtime. With
Props interface we can get feedback immediately from the compiler.

{% highlight js %}
// This errors on compile because onSave is required but not specified.
<TodoTextInput/>
{% endhighlight %}

![](/images/tsx-error-2.png)

{% highlight js %}
// This errors because onSave is the wrong type.
<TodoTextInput onSave={true}/>
{% endhighlight %}

![](/images/tsx-error-1.png)

{% highlight js %}
// This errors because onEdit is not a valid property.
<TodoTextInput onEdit={() => {}} onSave={() => {}}/>
{% endhighlight %}

![](/images/tsx-error-3.png)

Unfortunately, as of this writing Visual Studio Code (the editor I am using) does not seem to support TSX files yet.
The above errors were from Webpack with ts-loader.

### Types and Redux



## Resouces

- [TypeScript Handbook](http://www.typescriptlang.org/Handbook)
