---
created_at: 2015-06-02 21:24Z
layout: post
title: Why You Should Care About Flux
tags: [javascript,architecture]
---

If you have not been developing using [Flux](https://facebook.github.io/flux/) yet I would strongly urge you to check it out.

As I've discussed before, [the ideas behind Flux are not new](http://jaysoo.ca/2015/02/06/what-the-flux/). However, its application
to frontend architecture has had a significant impact on developers, myself included.

So why should *you* care about Flux?

The benefit of Flux is that it makes your code much easier to reason about. It achieves this by:

1. Separating the rendering of a component from its interactions. 
2. Eliminating local states in favour of shared states.


## Separating Reads From Writes

We are all humans, which means we have limited mental capacity. This is why we break bigger problems into smaller ones; Create
smallers modules from bigger ones.

In Rich Hickey's talk, [Simplicity Matters](https://www.youtube.com/watch?v=rI8tNMsozo0), he talks about how making things
easy means bringing it near to our capabilities. In this sense, we *need* to break problems down to the size that will
fit into our heads.

In Flux, we can partition the functions of a component into two distinct groups:

1. **Reading** from the system and rendering.
2. Capturing user interactions and **writing** to the system.

We must never complect these two groups together.

This makes our component much simpler. Its rendering is only affected by Stores, and user interactions
are mapped to the corresponding Actions. The two responsibilities do not directly affect one another.

Take the following React example of a top navigation user link.

{% highlight js %}
class TopNavUserLink extends React.Component {
  constructor(props) {
    super(props);
    UserStore.addListener('change', this.updateUser);
  }
  
  render() {
    return (<div>
      Hello {this.state.user.name}!
      <a onClick={this.signOut}>Sign out</a>
    </div>);
  }
  
  // Causes render() to be called.
  updateUser() {
    this.setState({ user: UserStore.getUser() });
  }
  
  // An action is created, which eventually will cause a UserStore change.
  signOut() {
    UserActions.signOut(this.state.user);
  }  
}
{% endhighlight %}

This example shows that rendering is only affected by the `UserStore`. And signing out simply means calling `UserActons.signOut`.
We don't directly mutate the state of the component after signing out. The state will eventually be updated when `UserStore`
updates, or potentially something may cause the store to not update. We don't care!

### Implications

The implications are that if we have a rendering problem, then we only need to check two things:

1. That our component's `render()` method is correct based on what it gets from the Store.
2. That the Store is updating correctly based on Actions dispatched. e.g Store projects Actions to the correct state.

If we have a user interaction bug, then we only need to check.

1. That our component is passing the correct data to its callbacks.
2. That the Action (or ActionCreator) handles the data correctly.

### Up to Eleven

Let's take this concept even further by eliminating component states completely.

In React, we can achieve this by wrapping our component within a container.

{% highlight js %}
// We introduce a container that interacts with Stores and Actions
class TopNavContainer extends React.Component {
  constructor(props) {
    super(props);
    UserStore.addListener('change', () => {
      this.setState({ user: UserStore.getUser() });
    });
  }
  
  render() {
    return <TopNavUserLink user={this.state.user} onSignOut={this.signOut} />
  }
  
  signOut(user) {
    UserActions.signOut(user);
  }
}

// Our component then becomes even simpler
class TopNavUserLink extends React.Component {
  static propTypes = { user: object, onSignOut: func }
  
  render() {
    return (<div>
      Hello {this.props.user.name}!
      <a onClick={this.onSignOut}>Sign out</a>
    </div>);
  }
  
  onSignOut() {
    this.props.onSignOut(this.props.user);
  }
}
{% endhighlight %}

You may have noticed that our render function is more or less a referentially transparent function. That is, it maps some
data to HTML. If we call the render with the same data, we will always get the same result. This is a very nice property!

As a bonus, we have also made our component much easier to test because we don't have to account for state mutations.


## Eliminating Local States

Having local states littered across multiple components can quickly get out of hand. Each mutable state
means yet another thing we have to keep in our head when trying to reason about our application.

Recall from our previous container example that we pushed component state onto the container. The container gets its state
from Stores, which are the sources of truth within Flux.

Practically, this means that all of our *complex state mutations* only happen within Stores.

There are some local states kept within containers, however these should only reflect what are inside Stores.

For example, this would be a bad container.

{% highlight js %}
class NumberSquaredContainer extends React.Component {
  constructor(props) {
    super(props);
    NumberStore.addListener('change', this.updateState);
  }
  
  render() {
    return <Number number={this.state.squaredNumber} />;
  }
  
  updateState() {
    const x = NumberStore.getNumber();
    this.setState({
      squaredNumber: x * x
    });
  }
}
{% endhighlight %}

Here, the `NumberSquaredContainer` container is no longer just updating its state from Store values. It contains the squaring logic
that should be in a store.

{% highlight js %}
class NumberStore extends EventEmitter {
 constructor() {
   Dispatcher.on('NUMBER_UPDATED', this.setNumber);
   this.state = {};
 }
 
 setNumber(x) {
   this.state.number = x;
 }
 
 getNumber() {
   return this.state.number;
 }
 
 getNumberSquared() {
   const { x } = this.state;
   return x * x;
 }
}
{% endhighlight %}

This refactoring is important because other containers that depend on the same data should be reading it from the store. Otherwise,
you'll have to share the squaring logic amongst all the components, and make sure they all maintain the correct local state.

By pushing state further and further up, we simplify our application by decreasing the amount mutable states we have to keep track of.
Moreover, our business logic is pushed to a smaller number of objects -- Stores as opposed to containers/components.


### Up to Eleven

Even though we pushed the state up to Stores, a badly implemented container/component can still rain on our parade -- perhaps unintentionally.

{% highlight js %}
class UserContainer extends React.Component {
  // ...
  
  updateName(evt) {
    const { user } = this.props;
   
    // This may unintentially mutate the Store state if this.props.data was passed
    // by reference from Store state.
    data.name = evt.target.value;
   
    // Even if this fails, the store's user name may have been updated already.
    // Oops, now our application may be in a bad state!
    UserActions.updateUser(data);
  }
}
{% endhighlight %}

To guarantee that our Store state cannot be mutated outside of the Store, we can turn to [Immutable-js](https://github.com/facebook/immutable-js).

{% highlight js %}
class UserStore extends EventEmitter {
  constructor() {
    Dispatcher.on('USER_UPDATED', this.update);
    
    // The state cannot be mutated outside of this store.
    this.state = Immutable.Map({});
  }
  
  update({ user }) {
    this.state = this.state.set('user', user); 
  }
}
{% endhighlight %}


## Wrap-up

In this post, we saw how adopting Flux can simplify our application.

Firstly, by separating reading from writing, we make our application much easier to reason about. For any rendering issue,
we only need to check Store logic and component rendering logic. For any interaction bugs, we only need to check our component
handlers and Action logic.

Secondly, by pushing state further up to the Stores, we decrease the amount of mutable state we need to keep track of within our
application.

Have you tried Flux? What are your thoughts?
