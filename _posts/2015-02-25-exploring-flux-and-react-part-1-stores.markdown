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
    Dispatcher.register('ITEM_ADDED', this.onItemRemoved);
  }
  
  // Project item added to our transient state.
  onItemAdded(item) {
    this._items.push(item);
  }
  
  // Project item removed to our transient state.
  onItemRemoved(item) {
    this._items = this._items.filter(i => i.id !== item.id);
  }
  
  // Our read method that Views will call.
  items() {
    return this._items;
  }
}
```

Okay, that's pretty cool. But, why go through all the ceremony of Stores and Actions? I could have done something much simpler in MVC *without* all the boilerplate. 

### MVC, keep it simple!

In MVC, all I would need is a **ShoppingCart** model that has many **Items**. When the user adds an Item I will simply add it to the ShoppingCart and re-render.

```js
class ShoppingCartView extends View {
  constructor(shoppingCart) {
    this.shoppingCart = shoppingCart;
    this.shoppingCart.on('change', this.render);
    
    this.$element.on('click', '.add', this.addItem);
    this.$element.on('click', '.remove', this.removeItem);
  }
  
  addItem(item) {
    this.shoppingCart.addItem(item);
  }
  
  removeItem(item) {
    this.shoppingCart.removeItem(item);
  }
  
  render() {
    // ...
  }
}
```

See? Easy! And we only have a two types of objects (View + Model) as opposed to four (View, Actions, Store, Dispatcher).

Fine. But what if I told you that I  conducted a study which shows that Items removed within the last  5 minutes by a user has a 90% chance to be purchased by the same user within the same period?

As a product owner, I want you to also **display** a list of Items the user has **removed** in the last **5 minutes**.

If we were to use MVC, we could maintain a separate **RemovedItemsCollections** and have the ShoppingCartView also update that collection. And of course, we will need a separate View to display that list.

```js
class ShoppingCartView extends View {
  constructor(shoppingCart, removedItems) {
    // ...
    this.removedItems = removedItems;
  }
  
  /// ...
  
  removeItem(item) {
    this.shoppingCart.removeItem(item);
    this.removedItems.add(item);
  }
}

class RemovedItemsView extends View {
  constructor(removedItems) {
    this.removedItems = removedItems;
    this.removedItems.on('change', this.render);
  }
  
  render() {
    // ...
  }
}
```

Come to think of it, we also need a timer to remove the Item from `removedItems` after 5 minutes.

```js
removeItem(item) {
    this.shoppingCart.removeItem(item);
    this.removedItems.add(item);
    
    // Remove this item after 5 minutes.
    setTimeout(=> this.removedItems.remove(item), 5000);
}
```

### Okay, maybe it's not so simple

I've only presented you with one small tweak in what we display to the user, and yet you can see how complex our MVC system became. Imgagine an ever growing list of display requirements, all driven by the same Actions. This is where MVC breaks down.

## Populating Store data

## Testing Stores

### Unit tests

### Smoke tests

Run through commands and make sure our stores are in the correct state.

## Final thoughts

