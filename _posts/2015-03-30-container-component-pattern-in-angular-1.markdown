---
created_at: 2015-03-30 00:01Z
layout: post
title: Containers and  Components in Angular 1
tags: [javascript, angular]
---

In this post, I want to explore a different approach to writing directives in
Angular 1. As we know, building applications in Angular 2 is going to be
different from what we're used to in Angular 1. For example, `ng-controller` will
be gone, and components will be the building blocks of applications.

What exactly is a component? It is essentially a thing that encapsulates an
internal state and manages external interactions. The interactions could be with
the user or with other components.

Since I've been working heavily with [React](https://facebook.github.io/react/index.html)
recently, I want to see how we can borrow some ideas from there and apply them
to Angular 1 directives.

In particular, I want to explore the idea of **[Containers and Components](https://www.youtube.com/watch?v=KYzlpRvWZ6c&t=1351)**
in Angular 1.

See my [GitHub repository](https://github.com/jaysoo/todomvc-angular1-components) for the full working source code.


<div class="alert alert-warning">
  <strong>Warning:</strong> This post was written for AngularJS 1.4 and may contain outdated information.
  Please see <a href="http://www.codelord.net/2016/11/23/spotting-outdated-angular-1-dot-x-posts/">this post</a>
  for things to watch out for when reading older Angular posts.
</div>

### Before We Begin...

I will be writing directives in the following pattern. Please read the comments
for reasoning.

{% assign hello_msg = '{{ctrl.message}}' %}
{% highlight javascript %}
m.directive('hello', () => ({
  // Always isolate scope to better encapsulate internal state.
  // Also serves as documentation for what the directive accepts.
  scope: {
    message: '=' // <hello message="'world'"></hello>
  },

  // Inline template for locality. Keeping template close to controller
  // makes code easier to reason about.
  template: `
    <p>Hello {{hello_msg}}!</p>
  `,

  // Always declare a controller class. Having a controller
  // class also us to test it in isolation if needed.
  // Even if there are no methods on the class, Angular still
  // requires it to be defined in order to bind properties to it.
  controller: class {
    constructor() {}
  },

  // Set properties on controller instance instead of the scope.
  // Internal state of the directive should be captured entirely by the
  // controller instance. This reduces the amount of objects we have to
  // deal with.
  bindToController: true,

  // Standardize the controller instance property on the scope. This should
  // be the only property you access on the scope (only because we have to).
  // Since we are using isolate scope, there are no clashes with other
  // controller instances.
  controllerAs: 'ctrl'
}));
{% endhighlight %}

So without further ado, let's begin.

## The Container

The idea is simple. A *container* is responsible for data fetching and passing data
down to its child components to render. The *components* are concerned with
rendering the UI based on the data passed down. They can also handle UI interactions.

![](/images/container-components-2.svg)

Notice that services only interact with containers and never components. Essentially,
containers are the data layers of the application.

*Why* is this pattern useful? Separation of concerns of course!

## A Concrete Example

Say, we have the following component.

{% assign user_name = '{{ctrl.user.name}}' %}

{% highlight javascript %}
m.directive('userGreeting', () => ({
  template: '<p>Hello {{ user_name }}</p>',
  controller: class {
    constructor(userService) {
      // Get user from remote source, then update state.
      userService.get().then((user) => this.user = user);
    }
  },
  bindToController: true,
  controllerAs: 'ctrl'
}));
{% endhighlight %}

This code definitely works. But what if we want to reuse the component using different
services, or no service at all? Dependency injection in Angular helps,
but they are not always necessary nor the best solution.

We can instead separate the data fetching concern with the rendering concern.

{% highlight javascript %}
// 1. The container that talks to userService.
m.directive('userGreetingContainer', () => ({
  template: '<user-greeting user="ctrl.user"></user-greeting>',
  controller: class {
    constructor(userService) {
      this.userService = userService;

      // Data fetching, same as before.
      this.userService.get().then((user) => this.user = user);
    }
  },
  bindToController: true,
  controllerAs: 'ctrl'
}));

// 2. The component that renders UI based on the user data passed into it.
m.directive('userGreeting', () => ({
  scope: {
    user: '='
  },
  template: '<p>Hello {{ user_name }}</p>',
  controller: class {},
  bindToController: true,
  controllerAs: 'ctrl'
}));
{% endhighlight %}

What happened here? Well, we definitely introduced more code. The main benefit
here though is that we can easily test the message rendering without having
to provide test doubles.

{% highlight javascript %}
describe('userGreeting', () => {
  it('greets user', () => {
    const scope = $rootScope.$new();
    const element = $compile(
      '<user-greeting user="user"></user-greeting>'
    )(scope);

    scope.user = {name: 'Bob'};
    scope.$apply();

    expect(element.html()).to.match(/Hello Bob/);
  });
});
{% endhighlight %}

The other advantage of this approach is that we can plug the component into
other containers. As long as the container passes data through the `user`
attribute to `userGreeting` then everything will just work!

## Interaction with data services

Certain interactions with the UI should affect application data. Form submissions
may require new resources to be created.

A component can accept *callbacks* that will be invoked when certain events
happen. In Angular, this is done with the `&` attribute on an isolate scope.
The container can pass its handlers to child components as callbacks,
but interaction with data services still reside in the container.

Let's say we want to add a feature for users to double-click on their name in the
greeting to edit it. When a double-click event occurs, the name is replaced
with an input box where the user can type in a new name and hit Enter to save.

The editable name component is as follows.

{% highlight javascript %}
m.directive('editableUserName', () => ({
  scope: {
    user: '=',
    saveCallback: '&onSave' // Rename the onSave attribute for clarity.
  },
  template: `
    <div>
      <span ng-dblclick="ctrl.edit()" ng-show="!ctrl.isEditing()">
        {{ user_name }}
      </span>
      <form ng-submit="ctrl.saveUser()">
        <input ng-show="ctrl.isEditing()"
               ng-model="ctrl.userForm.name" 
               ng-blur="ctrl.reset()" />
      </form>
    </div>
  `,
  controller: class {
    edit() {
      // Set a temporary form object for editing.
      this.userForm = Object.assign({}, this.user);
    }

    reset() {
      this.userForm = null;
    }

    isEditing() {
      return !!this.userForm;
    }

    saveUser() {
      // Invoke callback from container.
      this.saveCallback({user: this.userForm});
      this.reset();
    }
  },
  bindToController: true,
  controllerAs: 'ctrl'
}));
{% endhighlight %}

Now, in the `userGreeting` directive, we replace the user name
with the new UI directive. We also need to chain the `onSave` callback
from container to the child `editableUserName` directive.

{% highlight javascript %}
m.directive('userGreeting', () => ({
  scope: {
    user: '=',
    saveCallback '&onSave' // NEW: Take in onSave callback from container.
  },
  // NEW: Pass user data and onSave callback to child component.
  template: `
    <p>
      Hello
      <editable-user-name
        user="ctrl.user"
        on-save="ctrl.handleSave(user)">
      </editable-user-name>
    </p>
  `,
  controller: class {
    // NEW: Chain the callback from child to container.
    handleSave(user) {
      this.saveCallback({user: user});
    }
  },
  bindToController: true,
  controllerAs: 'ctrl'
}));
{% endhighlight %}

And finally, we pass the callback from the container, which handles actual
service invocation.

{% highlight javascript %}
m.directive('userGreetingContainer', () => ({
  // NEW: Pass the onSave callback.
  template: `
    <user-greeting 
      user="ctrl.user"
      on-save="ctrl.handleSave(user)">
    </user-greeting>
  `,
  controller: class {
    constructor(userService) {
      this.userService = userService;
      this.userService.get().then((user) => this.user = user);
    }

    // NEW: Save handler that calls service then updates state.
    handleSave(user) {
      userService.save(user).then((u) => this.user = u);
    }
  },
  bindToController: true,
  controllerAs: 'ctrl'
}));
{% endhighlight %}

<div class="alert alert-info">
  <p><strong>Note:</strong> The <code>editableUserName</code> component never modifies
  its own state directly (e.g. set <code>this.user</code>). Instead, when the
  <code>userGreetingContainer.handleSave()</code> method is resolved, the container updates
  its own state. And since it passes the <code>user</code> object to components,
  the components will get the updated object automatically.</p>
</div>

Phew, we're done! Below you will find the finished product.

{% plunker src:Htwcx8ff2GuBOk3vLMGT height:110px %}

Feel free to [fork it](http://plnkr.co/edit/Htwcx8ff2GuBOk3vLMGT) and play around
with it yourself.

## Summary

- We can group directives into two types: **container** and UI **components**.
- Containers are the data layers. They handle interactions with data services and pass data to components.
- Components render data, and they do not mutate this data.
- Containers can pass handlers, that interact with data services, as callbacks to components.

