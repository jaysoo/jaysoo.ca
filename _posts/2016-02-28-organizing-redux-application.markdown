---
created_at: 2016-02-28 06:38Z
layout: post
title: Three Rules For Structuring (Redux) Applications
redirect_from:
  - /2016/02/28/organizing-redux-application/
tags: [programming,javascript,react,redux]
---

In this series we are looking at code organization in the context of a React and Redux application. The takeaways for the "Three Rules" presented here
should be applicable to any application, not just React/Redux.

**Series contents**

- Part 1 - Three Rules for Structuring (Redux) Applications
  - [Rule #1: Organize by feature]({% post_url 2016-02-28-organizing-redux-application %}#rule-1-organize-by-feature)
  - [Rule #2: Create strict module boundaries]({% post_url 2016-02-28-organizing-redux-application %}#rule-2-create-strict-module-boundaries)
  - [Rule #3: Avoid circular dependencies]({% post_url 2016-02-28-organizing-redux-application %}#rule-3-avoid-circular-dependencies)
- [Part 2 - The Anatomy Of A React & Redux Module (Applying The Three Rules)]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %})
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
  in the next post.
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
around this restriction in clever ways, but if you go down this road I can guarantee you that it
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

Now that we have our three rules, there is one last topic I want to discuss: How to detect project smells.

### Litmus test for project structure

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

## Summary

Project structure isn't a particularly exciting topic to discuss. It is, however, an important
one.

The three rules presented in this post are:

1. Organize by features
2. Create strict module boundaries
3. Avoid circular dependencies

In the [next post]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %}), we will
dive deeper into code examples and learn how these rules can be applied to a React and Redux project.


