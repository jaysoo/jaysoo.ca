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

### Properties interface vs React.PropTypes

Properties interface differs from `React.PropTypes` in that the latter will only give you errors during runtime. With
Properties interface we can get feedback immediately from the compiler.

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

In the TodoMVC example, I defined a `Todo` type that is used throughout the application. It is used as the return
type of
[actions/todos](https://github.com/jaysoo/todomvc-redux-react-typescript/blob/master/client/actions/todos.ts)
. The state of
[reducers/todos](https://github.com/jaysoo/todomvc-redux-react-typescript/blob/master/client/reducers/todos.ts) 
is `Todo[]`. And [the](https://github.com/jaysoo/todomvc-redux-react-typescript/blob/master/client/components/MainSection.tsx)
[components](https://github.com/jaysoo/todomvc-redux-react-typescript/blob/master/client/components/TodoItem.tsx)
[all](https://github.com/jaysoo/todomvc-redux-react-typescript/blob/master/client/components/TodoTextInput.tsx) take in
`Todo` or `Todo[]` as properties.

This ensures that as I am coding, my actions and reducers (stores) all work with the correct types.

{% highlight js %}
/* actions/todos.ts */

// This action takes in a `string` and returns `Todo` as its payload.
const addTodo = createAction<Todo>(
  types.ADD_TODO,
  (text: string) => ({ text, completed: false })
);

/* reducers/todos.ts */

// This reducer takes current state of Todo[] and returns a new state of Todo[].
export default handleActions<Todo[]>({
  [ADD_TODO]: (state: Todo[], action: Action): Todo[] => {
    return [{
      id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
      completed: action.payload.completed,
      text: action.payload.text
    }, ...state];
  }
  // ...
}, initialState);
{% endhighlight %}

This means I now benefit from all the error and type hints within my actions and reducers.

![](/images/ts-action.png)

### Using union types as models

Let's add an initializing state to the `todos` reducer by introducing a `Model` union type for it.

{% highlight js %}
// This denotes that the state is still initializing.
// There is a progress propert that is a number from 0-100 (%).
export interface Initializing {
  progress: number;
};

// The model or our state can be either of these types.
export type Model = Initializing | Todo[];

// Check if x is a type of Initializing. This can be used in type guards.
export const isInitializing = (x: any): x is Initializing => {
  return typeof x.progress === 'number';
}
{% endhighlight %}

We'll have to change our reducer's state from type `Todo[]` to `Model`, and add type guards to our
reduce functions.

{% highlight js %}
export default handleActions<Model>({
  [ADD_TODO]: (state: Model, action: Action): Model => {
    let todos: Todo[];

    if (isInitializing(state)) {
      // If current state is initializing, set todos to empty array.
      todos = [];
    } else {
      // Otherwise set to current state.
      todos = state;
    }

    return [{
      id: todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
      completed: action.payload.completed,
      text: action.payload.text
    }, ...todos];
  }
  // ...
});
{% endhighlight %}

The type guard ensures that in the `else` branch, `state` is of type `Todo[]`, which is why the above code compiles.

<div class="alert alert-info">
  <strong>Note:</strong> I chose to not use a class for <code>Initializing</code>, but used an interface instead. The
  downside of this approach is that you cannot use <code>state instanceof Initializing</code> in the type guard since
  interfaces are not available for reflection during run time. It's up to you how you want to implement your own types.
</div>

#### Rendering the initializing state

Within my `App` component, I can use the same `Model` and type check function to render an initializing state.

{% highlight js %}
render() {
  const todos: Model = this.props.todos;
  const dispatch = this.props.dispatch;
  const actions = bindActionCreators(TodoActions, dispatch);

  if (isInitializing(todos)) {
    const style = {
      'font-size': '24px',
      'text-align': 'center'
    };
    return <p style={style}>Initializing... ({todos.progress}%)</p>
  } else {
    return (
      <div className="todoapp">
        <Header addTodo={actions.addTodo} />
        <MainSection
          todos={todos}
          actions={actions}/>
      </div>
    );
  }
}
{% endhighlight %}

The alternative to this approach might be to change our state to the following type.

{% highlight js %}
// todos can now be undefined or null.
type Model = {
  todos?: Todo[];
  isInitializing: boolean;
  initializationProgress: number;
}
{% endhighlight %}

This trades in the union type for a boolean flag to let us know why `todos` is `undefined` or `null`. This also makes
our state much harder to reason about when we add in more and more flags and metadata. From my experience with real-world
applications, doing this type of thing is hard to avoid without types.

This initialization example is a bit contrived, but I hope it shows the power behind the technique. I have a
[branch](https://github.com/jaysoo/todomvc-redux-react-typescript/tree/union-types)
of that shows how the above code works in the TodoMVC app. Fair warning, it is not completely functional because I only
did enough work to get a few examples.


## Closing Remarks

In this post I offered a glimpse of how TypeScript can help you when writing a React application. Some **benefits** you
will receive are:

- Type hints as you code (in editors that support TypeScript).
- Type errors during compile time, or as you code in supported editors.
- Guarantees against certain classes of errors when your application compiles successfully. (typos, wrong `props` usage, etc.)
- Union types to simplify application state.

Does this mean you should rewrite your React application in TypeScript right now? It's up to you. There are **downsides**
in choosing TypeScript.

- Your favourite editor may not support TypeScript. Best editors right now would be 
  [WebStorm](https://www.jetbrains.com/webstorm/) or [Visual Studio Code](https://code.visualstudio.com/) IMO.
- As of this writing, Visual Studio Code does not support TSX files (at least from my observation).
- You will need to invest in more tools (TSD, ts-loader for Webpack, etc.).

If you think the benefits outweigh the the costs, definitely give TypeScript a go!

## Resources

- [TypeScript Handbook](http://www.typescriptlang.org/Handbook)
- [TypeScript and JSX](http://www.jbrantly.com/typescript-and-jsx/)
- [Redux](https://github.com/rackt/redux/) (Flux-like framework)
