---
created_at: 2016-02-28 06:38Z
layout: post
title: Rules For Structuring (Redux) Applications
tags: [programming,javascript,react,redux]
---

As our applications grow, we often find that file structure and organization
to be crucial for the maintainability of application code.

What I want to do in this post is to present three organizational rules that I
personally follow on my own projects. By following the rules, your application code
should be easier to reason about, and you will find yourself wasting less time on file
navigation, tedious refactoring, and bug fixes.

I hope that these tips will prove useful for developers who want to improve their application
structure, but don't know where to start.

## Three rules for project structure

The following are some basic rules for structuring a project. It should be
noted that the rules themselves are framework and language agnostic, so you should
should be able to follow them in all situations. However, the examples
are in React and Redux. Familiarity with these frameworks is useful.

### Rule #1: Organize by feature

Let's first start by going over what not to do. A common way that projects can be
organized is by object roles.

**Redux + React:**

{% highlight js %}
actions/
  todos.js
components/
  todos/
    TodoItem.js
    ...
constants/
  actionTypes.js
reducers/
  todos.js
index.js
rootReducer.js
{% endhighlight %}

**AngularJS:**

{% highlight js %}
controllers/
directives/
services/
templates/
index.js
{% endhighlight %}

**Ruby on Rails:**

{% highlight js %}
app/
  controllers/
  models/
  views/
{% endhighlight %}

It may seem reasonable to group similar objects together like this (controllers with controllers,
components with components), however as the application grows this structure does not scale.

When you add and change features, you'll start to notice that some groups of objects tend to change
together. **These objects group together to form a feature module**. For example, in a todo app, when
you change the `reducers/todos.js` file, it is likely that you will also change `actions/todos.js`
and `components/todos/*.js`.

Instead of wasting time scrolling through your directories looking for `todos` related
files, it is much better to have them sitting in the same location.

**A better way to structure Redux + React project:**

{% highlight js %}
todos/
  components/
  actions.js
  actionTypes.js
  constants.js
  index.js
  reducer.js
index.js
rootReducer.js
{% endhighlight %}

<div class="alert alert-info">
  <strong>Note:</strong> I will go into the details of what's inside the files
  later in this post.
</div>

In a large project, organizing by feature affords you the ability to focus on the feature
at hand, instead of having to worry about navigating the entire project. This
means that if I need to change something related to `todos`, I can work soley
within that module and not even think about the rest of the application. In a
sense, it creates an **application within the main application**.

On the surface, organizing by feature may seem like an aesthetics concern, but
as we will see in the next two rules, this way of structuring projects will help
simplify your application code.

### Rule #2: Create strict module boundaries

In his Ruby Conf 2012 talk [Simplicity Matters](https://www.youtube.com/watch?v=rI8tNMsozo0),
Rich Hickey defines complexity as the **complecting** (or interleaving) of things. When
you couple modules together, you can picture an actual knot or braid forming in your code.

![](/images/four_string_braided-strap.jpg)

The relevence of complexity to project structure is that when you place objects in **close
proximity** to one another, the **barrier to couple** them lowers dramatically.

As an example, let's say
that we want to add a new feature to our TODO app: We want the ability to manage
TODO lists by *project*. That means we will create a new module called `projects`.

{% highlight js %}
projects/
  components/
  actions.js
  actionTypes.js
  reducers.js
  index.js
todos/
index.js
{% endhighlight %}

Now, it is obvious that the *projects* module will have a dependency on `todos`. In this
situation, it is important that we exercise discipline and only couple to the "public"
API exposed in `todos/index.js`.

**BAD**

{% highlight js %}
import actions from '../todos/actions';
import TodoItem from '../todos/components/TodoItem';
{% endhighlight %}

**GOOD**

{% highlight js %}
import todos from '../todos';
const { actions, TodoItem } = todos;
{% endhighlight %}

Another thing to **avoid is coupling to the state of another module**. For example, say that
within the `projects` module, we need to grab information out of `todos` state in order
to render a component. It is better that the `todos` module exposes an interface for `projects`
to query this information, rather than complecting the component with `todos` state.


**BAD**

{% highlight js %}
const ProjectTodos = ({ todos }) => (
  <div>
    {todos.map(t => <TodoItem todo={t}/>)}
  </div>
);

// Connect to todos state
const ProjectTodosContainer = connect(
  // state is Redux state, props is React component props.
  (state, props) => {
    const project = state.projects[props.projectID];

    // This couples to the todos state. BAD!
    const todos = state.todos.filter(
      t => project.todoIDs.includes(t.id)
    );

    return { todos };
  }
)(ProjectTodos);
{% endhighlight %}

**GOOD**

{% highlight js %}
import { createSelector } from 'reselect';
import todos from '../todos';

// Same as before
const ProjectTodos = ({ todos }) => (
  <div>
    {todos.map(t => <TodoItem todo={t}/>)}
  </div>
);

const ProjectTodosContainer = connect(
  createSelector(
    (state, props) => state.projects[props.projectID],

    // Let the todos module provide the implementation of the selector.
    // GOOD!
    todos.selectors.getAll,

    // Combine previous selectors, and provides final props.
    (project, todos) => {
      return {
        todos: todos.filter(t => project.todoIDs.includes(t.id))
      };
    }
  )
)(ProjectTodos);
{% endhighlight %}

In the "GOOD" example, the `projects` module is not concerned with the internal
state of `todos` module. This is powerful because we can freely change the structure
of the `todos` state, without worrying about breaking other dependent modules. Of course
we still need to maintain our selector contracts, but the alternative is having to
search through a whole bunch of disparate components and refactor them one by one.

By artificially creating strict module boundaries, we can simplify our application code,
and in turn increase the maintainability of our application. **Instead of haphazardly reaching inside
other modules, we should think about forming and maintaining contracts between them.**

Now that the projects are organized by features, and we have explicit boundaries between
each feature, there is one last thing I want to cover: *circular dependencies*.

### Rule #3: Avoid circular dependencies

It shouldn't take too much convincing for you to believe me when I say that circular dependencies are bad.
Yet, without proper project structure, it is all too easy to fall into this trap.

Most of the time, dependencies start out innoculously. We may *think* that the `projects` module need
to reduce some state based on `todos` actions. If we are not grouping by features, and we see a large
manifest of all action types within a global `actionTypes.js` file, it is all too easy for us to just reach
in and grab what we need (at the time) without a second thought.

Say, that within `todos` we want to reduce state based on an action type of `projects`. Easy enough
if we have a global `actionTypes.js` file. However, we will soon learn that this is no easy feat if we
have explicit module boundaries. To illustrate why, consider the following example.

#### Circular dependency example

Given:

**a.js**

{% highlight js %}
import b from './b';

export const name = 'Alice';

export default () => console.log(b);
{% endhighlight %}

**b.js**

{% highlight js %}
import { name } from './a';

export default `Hello ${name}!`;
{% endhighlight %}

What happens with the following code?

{% highlight js %}
import a from './a';

a(); // ???
{% endhighlight %}

We might expect "Hello Alice!" to be printed, but in actuality, `a()` would
print "Hello undefined!". This is because the `name` export of `a` is not available
when `a` is imported by `b` (due to circular dependencies).

The implication here is that we **cannot both have `projects` depend on action types within
`todos` *and* `todos` depend on action types within `projects.`** You can get
around restriction in clever ways, but if you go down this road I can guarantee you that it
will come to bite you later on!

#### Don't make hairballs!

Put another way, by creating circular dependencies, you are **complecting in the
worst possible way**. Imagine a module to be a strand of hair, then modules that
are inter-dependent on each other form a big, messy hairball.

![](/images/Matt_Groening_cat_hairball.gif)

Whenever you want to use a small module within the hairball, you will have no
choice but to pull in the giant mess. And even worse, when you change something
inside the hairball, it would be hard *not* to break something else.

By following Rule #2, it should make it hard for you to create these circular
dependencies. Don't fight against it. Instead, use that energy to properly factor
your modules.

## In-depth example and recommendations

I want to do a deeper dive into the contents of the different files within a Redux
and React application. This section will be specifically about these frameworks, so
feel free to skip if you are not interested in them. :)

Let's take a look at our TODO app again. (I added constants, model, and selectors into this example)

{% highlight js %}
todos/
  components/
  actions.js
  actionTypes.js
  constants.js
  index.js
  model.js
  reducer.js
  selectors.js
index.js
rootReducer.js
{% endhighlight %}

We can break these modules down by their responsibilities.

### Module index and constants

The module index is responsible for maintaining its public API. This is the exposed
surface where modules can interface with each other.

A minimum Redux + React application should be something like this.

{% highlight js %}
// todos/constants.js

// This will be used later in our root reducer and selectors
export const NAME = 'todos';
{% endhighlight %}


{% highlight js %}
// todos/index.js
import * as actions from './actions';
import * as components from './components';
import * as constants from './constants';
import reducer from './reducer';
import * as selectors from './selectors';

export default { actions, components, constants, reducer, selectors };
{% endhighlight %}

<div class="alert alert-info">
  <strong>Note:</strong> This is similar to the
  <a href="https://github.com/erikras/ducks-modular-redux">Ducks</a> structure.
</div>

### Action types & Action creators

Action types are just string constants within Redux. The only thing I've changed here
is that I prefixed each type with "todos/" in order to create a namespace for the module. This
avoid name collisions with other modules in the application.

{% highlight js %}
// todos/actionTypes.js
export const ADD = 'todos/ADD';
export const DELETE = 'todos/DELETE';
export const EDIT = 'todos/EDIT';
export const COMPLETE = 'todos/COMPLETE';
export const COMPLETE_ALL = 'todos/COMPLETE_ALL';;
export const CLEAR_COMPLETED = 'todos/CLEAR_COMPLETED';
{% endhighlight %}

As for action creators, not much changes from the usual Redux application.

{% highlight js %}
// todos/actions.js
import * as t from './actionTypes';

export const add = (text) => ({
  type: t.ADD,
  payload: { text }
});

// ...
{% endhighlight %}

Note that I don't necessarily need to use `addTodo` since I'm already in the `todos` module. In other
modules I may use an action creator as follows.

{% highlight js %}
import todos from 'todos';

// ...

todos.actions.add('Do that thing');
{% endhighlight %}

### Model

The `model.js` file is where I like to keep things that are related to the module's state.

This is especially useful if you are using TypeScript or Flow.

{% highlight js %}
// todos/model.js
export type Todo = {
  id?: number;
  text: string;
  completed: boolean;
};

// This is the model of our module state (e.g. return type of the reducer)
export type State = Todo[];

// Some utility functions that operates on our model
export const filterCompleted = todos => todos.filter(t => t.completed);

export const filterActive = todos => todos.filter(t => !t.completed);
{% endhighlight %}

### Reducers

For the reducers, each module should maintain their own state as before. However, there is one
particular coupling that should be solved. That is, a module's reducer does not usually get to
choose where it is mounted in the overall application state atom.

This is problematic, because it means our **module selectors** (which we will cover next) will be
**indirectly coupled to the root reducer**. In turn, the module components will also be coupled
to the root reducer.

We can solve this issue by giving control to the `todos` module on where it should be mounted
in the state atom.

{% highlight js %}
// rootReducer.js
import { combineReducers } from 'redux';
import todos from './todos';

export default combineReducers({
  [todos.constants.NAME]: todos.reducer
});
{% endhighlight %}

This removes the coupling between our `todos` module and root reducer. Of course, you don't
*have* to do it this way. Other options include relying on naming conventions (e.g. `todos` module
state is mounted under "todos" key in the state atom), or you can use module factory functions
instead of relying on a static key.

And the reducer would look as follows.

{% highlight js %}
// todos/reducer.js
import t from './actionTypes';
import { State } from './model';

const initialState: State = [{
  text: 'Use Redux',
  completed: false,
  id: 0
}];

export (state = initialState, action: any): State => {
  switch (action.type) {
    case t.ADD:
      return [
        // ...
      ];
    // ...
  }
};
{% endhighlight %}

### Selectors

Selectors provide a way to query data from the module state. While they are not
normally named as such in a Redux project, they are always present.

The first argument of `connect` is a selector in that it selects values out of
the state atom, and returns an object representing a component's props.

I would urge that common selectors by placed in the `selectors.js` file so they
can not only be reused within the module, but potentially be used by other modules
in the application.

I highly recommend that you check out [`reselect`](https://github.com/reactjs/reselect)
as it provides a way to build composable selectors that are automatically memoized.

{% highlight js %}
// todos/selectors.js
import { createSelector } from 'reselect';
import _ from 'lodash';
import { NAME } from './constants';
import { filterActive, filterCompleted } from './model';

export const getAll = state => state[NAME];

export const getCompleted = _.compose(filterCompleted, getAll);

export const getActive = _.compose(filterActive, getAll);

export const getCounts = createSelector(
  getAll,
  getCompleted,
  getActive,
  (allTodos, completedTodos, activeTodos) => ({
    all: allTodos.length,
    completed: completedTodos.length,
    active: activeTodos.length
  })
);
{% endhighlight %}

### Components

And lastly, we have our React components. I encourage you to use shared
selectors here as much as possible. It gives you the advantage of having an easy
way to unit test the mapping of state to props without relying on component tests.

Here's an example of a TODO list component.

{% highlight js %}
import { createStructuredSelector } from 'reselect';
import { getAll } from '../selectors';
import TodoItem from './TodoItem';

const TodoList = ({ todos }) => (
  <div>
    todos.map(t => <TodoItem todo={t}/>)
  </div>
);

export default connect(
  createStructuredSelector({
    todos: getAll
  })
)(TodoList);
{% endhighlight %}


That's it in terms of my recommendations. But before we go, there is one last topic I want
to discuss: How to detect project smells.

## Litmus test for project structure

It is important for us to have the tools to tell us when something smells in our code.
From experience, just because a project starts out clean doesn't mean it'll stay that way.
Thus, I want to present an easy method to detect project structure smells.

Every once in a while, pick a module in your application and **try to extract it as
an external module** (e.g. a NodeJS module, Ruby gem, etc). You don't have to actually
do it, but at least think it through. If you can perform this extraction without much
effort then you know it is well factored. The term "effort" here remains undefined, so you
need to come up with your own measure (whether subjective or objective).

Run this experiment with other modules in your application. Jot down any problems you
find in your experiments: circular dependencies, modules breaching boundaries, etc.

Whether you choose to take action based on your findings is up to you. Afterall, the
software industry is all about tradeoffs. But at the very least it should give you a much better
insight into your project structure.

## Closing

Project structure isn't a particularly exciting topic to discuss. It is, however, an important
one.

The three rules presented in this post are:

1. Organize by featues
2. Create strict module boundaries
3. Avoid circular dependencies

Whether you are using Redux and React or not, I highly recommend following these rules
on your software projects.

