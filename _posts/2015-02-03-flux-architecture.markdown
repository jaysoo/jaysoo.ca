---
created_at: 2015-02-03 15:38Z
layout: post
title: On Flux, CQRS, and DDD
tags: [javascript, flux, architecture, ddd, cqrs]
---

[Flux](http://facebook.github.io/flux/docs/overview.html) is an application
architecture designed by Facebook for their JavaScript applications. It was
first introduced by Facebook in May 2014, and it (along with along with the
complementary [React.js](http://facebook.github.io/react/) library) has since
garnered much interest in the JavaScript community.

It is important to note, however, that while these concepts may have found a new
home in JavaScript applications, they have been explored in the past. More
specifically, these concepts are very similar to **Domain-Driven Design** (DDD)
and **Command-Query Responsibility Segregation** (CQRS).  I think it is important
to learn from the past, and see how they may relate to the present.

In this post I will:

1. Give an overview of the Flux architecture.
1. Examine DDD and CQRS in more detail.
1. Look at how Flux applies the concepts from DDD + CQRS.
1. Share some thoughts on when Flux is needed.

A basic understanding of DDD will help, though it is not required. To learn more
about DDD, I recommend this [free ebook](http://www.infoq.com/minibooks/domain-driven-design-quickly)
from InfoQ on the subject.

## What is Flux?

A common way to describe Flux is by comparing it to a **Model-View-Controller**
(MVC) architecture.

In MVC, a Model can be read by multiple Views, and can be updated by multiple
Controllers. In a large application, this results in highly complex interactions
where a single update to a Model can cause Views to notify their Controllers,
which may trigger even more Model updates.

**INSERT GRAPHIC**

Flux attempts to solve this complexity by forcing a unidirectional data flow.
In this architecture, Views query Stores (not Models), and user interactions
result in Actions that is submitted to a centralized Dispatcher. When the Actions
are dispatched, Stores can then update themselves accordingly.

**INSERT GRAPHIC**

The main difference between MVC and Flux is the separation of queries and updates.
In MVC, the Model is both updated by the Controller *and* queried by the View.
In Flux, the data that a View gets from a Store is read-only. Stores can only be
updated through Actions, which would affect the Stores themselves *not* the
read-only data.

This pattern is essentially CQRS as first described by Greg Young.

## Command-Query Responsibility Segregation

To understand CQRS, let's first talk about the object pattern **Command-Query 
Separation** (CQS).

CQS at an object level means:

1. If a method mutates the state of the object, it is a *command*, and it must not return a value.
1. If the method returns some value, it is a *query*, and it must not mutate state.

In normal DDD, Aggregate objects are used for both command and query. We also
have Repositories that can find and persist Aggregate objects.

CQRS simply takes CQS further by separating command and query into different objects.
Aggregates would have no query methods, only command methods. Repositories would
now only have a single query method (e.g. `find`), and a single persist method
(e.g. `save`).

## The query processor

The *query model* is a pure data model, and is not meant to deliver domain behaviour.

## Command processing

The client submits commands by creating new actions. These actions are the commands
that can be submitted to the server, or an application services as the
means of executing behaviour on Aggregates.

The command model has designed contracts and behaviours, so matching the commands
to the contracts should be straightforward.

Each command is sent as an asynchronous message, and delivered to a handler designed
with the dedicated style.

??? Stores and services here are the command processors.

The asynchonouscity approach provides temporal decoupling.

As command methods on the command model is executed, it completes by publishing
and Event -- the Store event. This is the linchpin for updating the query model
with the most recent changes to the command model.


## Event subscriber

Updates query model according to Domain Events. Each event must be rich enough
to supply all the data necessary to update the query model.

## When to use Flux?

When the UI had complex interactions


## An example in e-commerce

Let's compare MVC to Flux using an example.

In an ecommerce system, we may find an aggregate ShoppingCart that contains multiple
CartItems, along with a corresponding repository.

{% highlight javascript %}
class ShoppingCart {
  constructor ({id: id, cartItems: cartItems}) {
    this.id = id;
    this.cartItems = cartItems || [];
  }
  addItem (cartItem) {
    this.cartItems.push(cartItem);
  }
  removeItem (cartItem) {
    this.cartItems = _.without(cartItems, cartItem);
  }
  totalPrice () {
    var prices = this.shoppingCart.cartItems.map((item) => item.price);
    var total = prices.reduce((total, price) => total + price, 0);
    return total;
  }
}

class CartItem {
  constructor ({sku: sku, description: description, price: price, quantity: quantity}) {
    this.sku = sku;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
  }
}

class ShoppingCartRepository {
  findById (shoppingCartId) { /* … */ }
  create (product) { /* … */ }
  update (product) { /* … */ }
  destroy (product) { /* … */ }
}
{% endhighlight %}

Let's say we are creating two views:

1. A ShoppingCartView to display current contents of the ShoppingCart.
1. A TotalPriceView that will sum up all CartItems, and present a total.

This may look something like:

{% highlight javascript %}
class ShoppingCartView extends View {
  constructor (element, shoppingCart) {
    this.element = element;
    this.shoppingCart = ShoppingCart;
    this.shoppingCart.on('changed', this.render);
  }
  render () {
    var html = this.shoppingCart.cartItems.map((item) => {
      `<li class="cart-item">
        Sku: ${item.sku}
        Description: ${item.description}
        Price: ${item.price}
        Quanity: ${item.quantity}
      </li>`
    }).join('');

    this.element.innerHTML = html;
  }
}

class TotalPriceView() {
  constructor (element, shoppingCart) {
    this.element = element;
    this.shoppingCart = ShoppingCart;
    this.shoppingCart.on('changed', this.render);
  }

  render () {
    this.element.innerHTML = `<div class="cart-total">
                                ${this.shoppingCart.total()}
                              </div>`;

  }
}
{% endhighlight %}


