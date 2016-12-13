---
created_at: 2016-12-12 21:36Z
layout: post
title: Additional Guidelines For (Redux) Project Structure
tags: [programming,javascript,react,redux]
---

In this series we are looking at code organization in the context of a React and Redux application. The takeaways for the "Three Rules" presented here
should be applicable to any application, not just React/Redux.

**Series contents**

- [Part 1 - Three Rules for Structuring (Redux) Applications]({% post_url 2016-02-28-organizing-redux-application %})
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
- Part 3 - Additional Guidelines For (Redux) Project Structure
  - [What to do with common components?]({% post_url 2016-12-12-additional-guidelines-for-project-structure %}#what-to-do-with-common-components)
  - [Exporting and testing connected components]({% post_url 2016-12-12-additional-guidelines-for-project-structure %}#exporting-and-testing-connected-components)
  - [Normalizing application state]({% post_url 2016-12-12-additional-guidelines-for-project-structure %}#normalizing-application-state)

---

The Three Rules I presented in the first post are purposely minimal. I don't believe in being too prescriptive on project structure, since a lot of
it will depend on the type of project or personal preferences.

What I want to do in this post is to present other (hopefully helpful!) guidelines for those looking for help with code organization.

## What to do with common components?

In a lot of applications, there will be common components that are used everywhere. Some examples could be `<Image>` or `<Title>` components
that are not related to any feature per se.

My recommendation for these components is to do one of two things.

1. Keep the common components outside of the `modules/` directory.
2. Make a `core` module that includes all of these components.

### Introducing a separate components folder

In this case, your application structure may be as follows.

{% highlight js %}
src/
  components/       <-- These are common components
    Image.js
    Title.js
    index.js
  modules/          <-- These are the feature modules
    todos/
      components/
      actions.js
      reducer.js
      ...
{% endhighlight %}


By moving common components outside of the `modules`, it *may* send a stronger signal that these components
are not coupled to any part of the application state.

### Using a core module for common concerns

{% highlight js %}
src/
  modules/          <-- These modules make up the entire application
    core/
      components/
        Image.js
        Title.js
        index.js
    todos/
      components/
      actions.js
      reducer.js
      ...
{% endhighlight %}

Using a `core` module to group common components reduces the number of "things" in system (everything is a module!), but perhaps
at the cost of having a wider definition of what a "module" is -- e.g. it may or may not manage a slice of the application state.

Regardless of whether you use a core module, or separate out common components, just make sure you don't end up throwing too
many components in there. If a component is part of a new feature then make sure a new feature module is created!

## Exporting and testing connected components

A connected component in a Redux application is one that is wired up to query from the state (using selectors), and can
dispatch actions.

I tend to expose connected components from my modules. The reasoning behind this is that the consumers of those components
don't necessarily want to wire up an unconnected component each time that they are used.

For example, the public interface of a `<Todo>` component should be its ID, and perhaps any additional options or callbacks.

{% highlight js %}
<Todo
  id={123}
  theme="dark"
  size="large"
  onUpdate={...}
/>
{% endhighlight %}

This hides all of the internal details of data flow within the `todos` module.

Contrast the above to an unconnected component.

{% highlight js %}
<Todo
  todo={...}
  actions={...}

  theme="dark"
  size="large"
  onUpdate={...}
/>
{% endhighlight %}

In the unconnected case, the consumer of the component has the additional responsibility of providing the queried `todo` object,
as well as any required `actions` functions (e.g. action creators). This means that you would have to keep repeating the same code
of importing action creators and selectors, and connecting them each time a `<Todo>` is used!

Now, there is one downside of exporting connected components. It makes **unit testing more complicated**, because each time you test
the component, you have to instantiate the Redux store with the correct reducers, etc.

One way to deal with this *is* to always test these components with stores. This has the benefit of being closer to integration tests,
however, it makes testing pure renders a lot more cumbersome. That is, if you just want to test that the component renders correctly,
given a set of inputs, then having to deal with stores is not ideal.

A simple solution is to export both the connected *and* unconnected components. The unconnected component can be exported only within
the module for testing purposes.

For example, a test for `<Todo>` may be as follows.

{% highlight js %}
// In todos/components/__tests__/Todo-test.js

import { shallow } from 'enzyme'
import test from 'tape'
import { Todo } from '../' // This named export is unconnected.

test('it renders correctly', function (t) {
  const todo = { id: 1, text: 'Finish writing post' }
  const wrapper = shallow(
    <Todo todo={todo}/>
  )

  t.ok(/Finish writing post/.test(wrapper.html()), 'renders text')

  t.end()
})
{% endhighlight %}

Given that the component is as follows.

{% highlight js %}
// In todos/components/Todo.js

// Exporting named, unconnected component for testing purposes.
export const Todo = ({ todo, actions }) => (
  <div>
    <p>{ todo.text }</p>
    ...
  </div>
)

// The default export is the connected component.
export default connect(...)(Todo)
{% endhighlight %}

And in the `todos/index.js` we would only export the connected component.

{% highlight js %}
// In todos/index.js

export Todo from './components/Todo'
{% endhighlight %}

## Normalizing application state

The last guideline is to always normalize your application state. This makes it much more natural to work with connected components and selectors from other modules.

For example, the `todos` module can hold its records in an object/map. A map is a good structure to use here since it allows easier lookup and deletion.

{% highlight js %}
{
  "todos": {
    "byId": {
      "1": { "id": 1, "text": "Item One", "done": false },
      "2": { "id": 2, "text": "Item Two", "done": true },
      "3": { "id": 3, "text": "Item Three", "done": false },
      ...
    }
  }
}
{% endhighlight %}

Then, in other modules (such as `projects`), we can reference Todos by their IDs.


{% highlight js %}
{
  "projects": {
    "byId": {
      "100": {
        "id": 100,
        "name": "Some Project",
        "todos": [1, 3] // These IDs should exist in the `todos` state.
      },
      ...
    }
  }
}
{% endhighlight %}

By normalizing data, we can **avoid stale data** issues, since we never duplicate the same object twice in the system. Any references to an entity has
to use its ID, not an object reference or a clone.

And as noted earlier, this normalization of state plays very nicely with connected components.


{% highlight js %}
const Project = ({ project }) => (
  <div>
    <h2>{ project.name }</h2>
    <p>
      Todos:
      {
        project.todos.map(todoId => (
          <Todo id={todoId}/>
        )
      }
    </p>
  </div>
)
{% endhighlight %}

### Reducing to normalized states

This also means that we need to handle loading normalized data. You can either do this using a saga -- where you use `put` to dispatch
the appropriate loading actions -- or you can use thunks.

{% highlight js %}
// Using saga
function* requestProject(id) {
  const response = yield call(fetch, `/projects/${id}`)
  yield put({ type: 'todos/LOAD', payload: response.todos })
  yield put({ type: 'projects/LOAD', payload: [response.project] })
}

// Using thunks
const requestProject = async (id) => {
  return (dispatch) => {
    const response = await fetch(`/projects/${id}`)

    // Dispatch events to both todos and projects module so we can store the normalized data.
    dispatch({ type: 'todos/LOAD', payload: response.todos })
    dispatch({ type: 'projects/LOAD', payload: [response.project] })
  }
}
{% endhighlight %}

If you are interested in learning more about sagas, I have a blog post about them [here](http://jaysoo.ca/2016/01/03/managing-processes-in-redux-using-sagas/).


## Closing

In this series, we [began]({% post_url 2016-02-28-organizing-redux-application %}) by looking at the Three Rules for structuring applications.

1. Organize by features
2. Create strict module boundaries
3. Avoid circular dependencies

Then, in the [second post]({% post_url 2016-02-28-applying-code-organization-rules-to-concrete-redux-code %}), we went into in-depth examples of how to structure each module with our application.

And lastly, in this post we explored additional guidelines to help with code organization.

- Where do common/unconnected/dumb components fit in?
- Exporting and testing connected components
- Normalizing application state

I hope this series has proven useful to you. Feel free to leave a comment, or reach me on [Twitter](https://twitter.com/jay_soo)!



