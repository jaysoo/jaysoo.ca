---
created_at: 2015-03-09 22:48Z
layout: post
title: On Flux Stores and Actions
tags: [javascript, flux]
---

There's been a lot of discussion on what Flux is, the different variations, and
how the pattern can be improved upon.  I've even blogged about Flux
[here](http://jaysoo.ca/2015/02/06/what-the-flux/) on this blog!

I've been doing a lot of work with React and Flux in the past month. In that time,
I learned a lot about architecture, patterns, and community best practices. I
want to share a few things that I've been thinking about here.

In this post, I want to focus on Flux Stores. I will cover:

1. What Stores are.
2. How they interact with Actions.
3. How we can test Stores.
4. Action replays.

## What are Stores?

In Flux, Stores are simply a place where data is read out from. More specifically,
Views within a Flux architecture will be notified of changes within Stores via
the [Observer pattern](http://en.wikipedia.org/wiki/Observer_pattern), and then
query for those data in order to update their own states.

What exactly do Stores observe to update their states? The answer is Actions.

### Actions

I like to think about Actions as things that have occurred in our domain. For
example, in an e-commerce system we may have Actions such as "3 Items added to Cart",
"1 Item removed from Cart", "Cart checked out", etc.

Actions carry a payload with them that contain all the information needed
about the Action. For example, for `ITEM_REMOVED` we may have this payload:

{% highlight js %}
{
  id: 'ITEM_REMOVED',
  payload: {
    itemId 888,
    name: 'Functional JavaScript',
    description: 'Introducing Functional Programming with Underscore.js',
    quantity: 1
  }
}
{% endhighlight %}

Of course, Actions are rarely what we display in the UI. When an user is buying
books in our e-commerce system, they want to see the *current state*
of their shopping cart, not a history of everything they've added or removed.

This is where Stores come in.

### Updating Stores from Actions

There is a concept called *Projections*. A Projection is a piece of code that
take a series of Actions and produces a transient state from them. In Flux, we
put both the Projections and the transient state within a Store.

{% highlight js %}
class ShoppingCartStore extends Store {
  constructor(Dispatcher) {
    // This is the transient state.
    this._items = [];

    // Subscribe to Actions and run them through our Projections.
    Dispatcher.register('ITEM_ADDED', this.onItemAdded);
    Dispatcher.register('ITEM_REMOVED', this.onItemRemoved);
  }

  // Project item added to our transient state.
  onItemAdded(item) {
    this._items.push(item);
    this.emit('change');
  }

  // Project item removed to our transient state.
  onItemRemoved(item) {
    this._items = this._items.filter(i => i.id !== item.id);
    this.emit('change');
  }

  // Our read method that Views will call.
  items() {
    return this._items;
  }
}
{% endhighlight %}

At this point, the Store has data about what Items are in the user's `ShoppingCart`.
Now imagine that research has shown that Items *recently removed* by the user
have a high chance to be purchased by said user.

A **new requirement** is added to display a list of Items removed by the user.

In Flux, we'll just add another Store.

{% highlight js %}
class RecentlyRemovedItemStore extends Store {
  constructor(Dispatcher) {
    this._removedItems = [];
    Dispatcher.register('ITEM_REMOVED', this.onItemRemoved);
  }

  onItemRemoved(item) {
    this._removedItems.push(item);
    this.emit('change');
  }

  recentlyRemovedItems() {
    this._removedItems;
  }
}
{% endhighlight %}

Notice that we still have just one `ITEM_REMOVED` Action. Nothing has been
changed in our Action's payload, but we now project two states from the Action.
Furthermore, the two states are completely decoupled from one another.

In a sense, the Actions are our sources of truth within the system. The transient
states within the Stores can change over time, but *Actions can neither be
updated nor destroyed* -- they should be immutable.

This is a nice property of Flux , and allows Stores to be tested rather easily.

## Testing Stores

Let's say we want to make sure `ShoppingCartStore` responds properly to three
Actions: `ITEMS_LOADED`, `ITEMS_ADDED`, and `ITEMS_REMOVED`. Here's how we can
test them.

{% highlight js %}
describe('ShoppingCartStore', () => {
  let dispatcher, store;

  beforeEach(() => {
    dispatcher = new Dispatcher();
    store = new ShoppingCartStore(dispatcher);
  });

  it('projects correct state from actions', () => {
    // Dispatch actions.
    dispatcher.dispatch({
      id: 'ITEMS_LOADED',
      payload: [ { itemId: 777, quantity: 2 } ]
    });

    dispatcher.dispatch({
      id: 'ITEM_ADDED',
      payload: { itemId: 888, quantity: 1 }
    });

    dispatcher.dispatch({
      id: 'ITEM_REMOVED',
      payload: { itemId: 777, quantity: 1 }
    });

    // Based on sequence of Actions above, we assert the following.
    expect(store.items()).to.eql([
      { id: 888, quantity: 1},
      { id: 777, quantity: 1}
    ]);
  });
{% endhighlight %}

We can also unit test on one particular Action instead of smoke tests like shown above.
Unit testing is especially helpful if the business logic in our Stores are complex.

One useful property of Stores is that given a **starting state** and a
**sequence of Actions**, we should always end up with the **same resulting state**
after playing the Actions. This makes testing a lot easier, and can also help us
*debug* our application.


## Action Replays

![](/images/Action_Replay_Amiga500.jpg)

<small class="muted"><em>
  (Image by <a href="http://commons.wikimedia.org/wiki/User:Afrank99">Afrank99</a>)
</em></small>

No, not *that* Action replay! ;)

Recall that we can re-create a Store's transient state by replaying
all Actions up to a certain point in time. This gives us another debugging tool
under our belt.

Let's say that we noticed a Store contains **bad data**, but we're not sure how
it got to that state. If we knew its initial state, and all the Actions played
since initialization, then we can pinpoint exactly when the state became bad.

### Persisting Actions

Practically speaking, we may want to **persist our Actions and Store state**
somewhere accessible for debugging purposes. This might be a bounded cached
in [localStorage](https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage#localStorage).

There is an idea called [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html)
that describes a system where all changes to the application state is captured
in an event object. In our case, this object is our *Action*. Greg Young has
a good talk about [CQRS and Event Sourcing](https://www.youtube.com/watch?v=JHGkaShoyNs)
that I highly recommend watching.

I won't go into Event Sourcing here, but I think it's an useful tool to have.

### Reproducing bugs locally

One thing I would like to try out is building a mechanism for serializing Store
states and the Action log. Then, whenever a bug is encountered in production, we
can grab these serialized objects in order to reproduce the bug locally.

CircleCI has done something similar, albeit not quite the same, with ClojureScript and Om
where they serialize the application state and rehydrate them locally.

Here's the video from their YouTube channel.

<iframe width="420" height="315" src="https://www.youtube.com/embed/5yHFTN-_mOo" frameborder="0" allowfullscreen></iframe>

## Final thoughts

In this post, I presented some ideas that I've been playing around with regarding
Flux Stores. I think Flux is a powerful pattern, and can help make client-side
applications more robust and easier to reason about.

Stores aren't terribly interesting on their own. Yet, there are some cool
concepts that can be tried with Stores within our own client-side applications.

