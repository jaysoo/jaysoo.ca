---
created_at: 2016-02-28 06:38Z
layout: post
title: The Anatomy Of A React & Redux Module (Applying The Three Rules)
tags: [programming,javascript,react,redux]
---

In this series we are looking at code organization in the context of a React and Redux application. The takeaways for the "Three Rules" presented here
should be applicable to any application, not just React/Redux.

**Series contents**

- [Part 1 - Three Rules for Structuring (Redux) Applications]({% post_url 2016-02-28-organizing-redux-application %})
  - [Rule #1: Organize by feature]({% post_url 2016-02-28-organizing-redux-application %}#rule-1-organize-by-feature)
  - [Rule #2: Create strict module boundaries]({% post_url 2016-02-28-organizing-redux-application %}#rule-2-create-strict-module-boundaries)
  - [Rule #3: Avoid circular dependencies]({% post_url 2016-02-28-organizing-redux-application %}#rule-3-avoid-circular-dependencies)
- Part 2 - The Anatomy of a React & Redux Module (Applying The Three Rules)
  - [Module index and constants]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %}#module-index-and-constants)
  - [Actions & Action creators]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %}#actions--action-creators)
  - [Model]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %}#model)
  - [Reducers]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %}#reducers)
  - [Selectors]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %}#selectors)
  - [Components]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %}#components)
- [Part 3 - Additional Guidelines For (Redux) Project Structure]({% post_url 2016-12-12-additional-guidelines-for-project-structure %})
  - [What to do with common components?]({% post_url 2016-12-12-additional-guidelines-for-project-structure %}#what-to-do-with-common-components)
  - [Exporting and testing connected components]({% post_url 2016-12-12-additional-guidelines-for-project-structure %}#exporting-and-testing-connected-components)
  - [Normalizing application state]({% post_url 2016-12-12-additional-guidelines-for-project-structure %}#normalizing-application-state)

---

In this post, we are expanding on the [three rules of structuring applications]({% post_url 2016-02-28-organizing-redux-application %})
and diving deeper into the contents of the different files with a Redux and React application.

This post will be specifically about React and Redux, so feel free to skip to the next post if you are not interested in these libraries.

## In-depth example and recommendations

Recall the three rules presented in the previous post:

1. Organize by features
2. Create strict module boundaries
3. Avoid circular dependencies

Now, let's take a look at our TODO app again. (I added constants, model, and selectors into this example)

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

### Actions & Action creators

Action types are just string constants within Redux. The only thing I've changed here
is that I prefixed each type with "todos/" in order to create a namespace for the module.
This helps to avoid name collisions with other modules in the application.

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
import type { State } from './model';

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


### Other responsibilities

There are many other things that could be included in a module. For example, you may be using [redux-saga](https://github.com/yelouafi/redux-saga),
which should definitely be included in your module structure -- where each module can optionally expose a root saga.

Other things that you may include are route handlers (or containers) for use with [react-router](https://github.com/ReactTraining/react-router) -- or a similar routing library.

## Summary

We've seen in this post how to break down a React/Redux module into individual core responsibilities.

- Index and constants - The public API and constants.
- Actions and action creators - Information that flow through the application.
- Model - Types and utilities for the model.
- Reducers - Updates module state.
- Selectors - Queries module state.

In the [last post]({% post_url 2016-12-12-additional-guidelines-for-project-structure %})
of this series on code organization, we will discuss additional guidelines that fall outside of the "Three Rules."

