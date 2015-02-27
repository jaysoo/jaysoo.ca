---
created_at: 2015-02-25 22:48Z
layout: post
title: On Stores and Event Sourcing - Exploring Flux and React Part 1
tags: [javascript, flux]
---

There's been a lot of discussion on what Flux is, the different variations, and how the pattern can be improved upon.
I've even blogged about Flux [here](http://jaysoo.ca/2015/02/06/what-the-flux/) on this blog!

I've spent significant amount of time in the last little while researching and building applications in Flux and React, trying
to learn has much as I can from what people have done. I thought I would contribute back by presenting my own thoughts and
learnings.

Although I will be sharing examples using both Flux and React, they are actually orthogonal to each other. You could, for example, use Angular with Flux, Backbone with React, and so forth.

I will be releasing each post separately in the next week or so:

1. On Stores and Event Sourcing (Flux)
2. A Tale of Two Components (React)
3. Late-Binding Through Contexts (React)

Of course, I welcome all feedback on the subject, so please leave a comment at the end if you have one.

And without further ado, here is the first post of the series: **On Stores and Event Sourcing**.

## What are Stores?

In Flux, Stores are simply a place where data is read out from. More specifically, Views within a Flux architecture will be notified of changes within Stores via the [Observer patter](http://en.wikipedia.org/wiki/Observer_pattern) and query for those data in order to update their own states.

So then, what in the system can affect Store states? The answer is of course, Actions.

### Actions aka Domain Events

I like to think about Actions as Domain Events (in the CQRS sense). They are things that have already happened in our application. For example, in an e-commerce system we may have Actions such as **3 Items added to Cart**, **1 Item removed from Cart**, **User checks out**, etc.

Of course, Actions are rarely are what we display in the UI, to the user. When a user is buying books in our e-commerce system, they want to see the *current state* of their shopping cart, not a history log of everything they've added or removed.

This is where our Stores come in.

### Updating Stores from Actions

There is a concept called *Projections*. A Projection is a piece of code that take a series of Actions and produces a transient state from them. In Flux, we put both the Projections and the transient state within a Store.

```js
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
```

Okay, cool. Now we have some data about what Items are in the use's ShoppingCart. But what if I told you that research has shown that Items *recently removed* by the user have a high chance to be purchased by said user?

As the product owner, I want you (the engineering) to also display a list of Items removed by the user.

No problem! Let's just add another Store.

```js
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
```

Notice that we still have the same `ITEM_REMOVED` Action, but now we project two states out of it?

## Event Sourcing

## Testing Stores

### Unit tests

### Smoke tests

Run through commands and make sure our stores are in the correct state.

## Final thoughts

