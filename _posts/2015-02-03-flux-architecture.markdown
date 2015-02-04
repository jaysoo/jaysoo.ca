---
created_at: 2015-02-03 15:38Z
layout: post
title: On Flux, CQRS, and DDD
tags: [javascript, flux, architecture, ddd, cqrs]
---

[Flux](http://facebook.github.io/flux/docs/overview.html) is an application
architecture designed by Facebook for their JavaScript applications. It was
first introduced by Facebook in May 2014, and it has since
garnered much interest in the JavaScript community.

It is important to note, however, that while these concepts may have found a new
home in JavaScript applications, they have been explored in the past. More
specifically, these concepts are very similar to **Domain-Driven Design** (DDD)
and **Command-Query Responsibility Segregation** (CQRS).  I think it is important
to learn from the past, and see how they may relate to the present.

In this post I will:

1. Give an overview of the Flux architecture.
1. Present the CQRS pattern.
1. Look at how Flux applies the concepts from CQRS.
1. Share some thoughts on when Flux is needed.

Knowledge of DDD is assumed, though the article still provides value without it.
To learn more about DDD, I recommend this [free ebook](http://www.infoq.com/minibooks/domain-driven-design-quickly)
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

In a CQRS system, you will find a few objects not found in normal DDD.

### The query model

The *query model* is a pure data model, and is not meant to deliver domain
behaviour. These models are denormalized, and meant for display and reporting.

Query models are usually retrieved by performing a query. The queries can be
handled by a *query processor* that knows how to look up data, say from a database
table.

### Command handling

*Commands* are submitted as the means of executing behaviour on Aggregates. A
command contains the name of the behaviour to execute and a payload
necessary to carry it out. The submission is received by a *command handler*,
which usually fetches an Aggregate from its repository, and executes a command
method on it.

As the command method completes, it publishes a Domain Event. This is crucial
for updating the query model with the most recent changes to the command model.

Note that commands are always in imperative tense since they describe behaviours that
need to be executed. e.g. `'ADD_ITEM_TO_CART'`

### Event subscriber

An event subscriber receives all Domain Events published by the command model.
When an event occurs, it updates the query model accordingly. Each event contain
enough information to correctly update the query model.

Note that Domain Events are always in past tense since they describe what has
already occurred. e.g. `'ITEM_ADDED_TO_CART'`

## An example in e-commerce

Let's compare normal DDD with CQRS in the context of an e-commerce system with
a shopping cart.

### Shopping cart with normal DDD

In normal DDD, we may find an Aggregate `ShoppingCart` that contains multiple `CartItems`,
as well as a corresponding repository.

{% highlight javascript %}
class ShoppingCart {
  constructor({id: id, cartItems: cartItems, taxPercentage: taxPercentage,
                shippingAndHandling: shippingAndHandling}) {
    this.id = id;
    this.cartItems = cartItems || [];
    this.taxPercentage = this.taxPercentage;
    this.shippingAndHandling = shippingAndHandling;
  }
  addItem(cartItem) {
    this.cartItems.push(cartItem);
  }
  removeItem(cartItem) {
    this.cartItems = _.without(cartItems, cartItem);
  }
  total() {
    var prices = this.shoppingCart.cartItems.map((item) => item.price);
    return prices.reduce((total, price) => total + price, 0);
  }
}

class CartItem {
  constructor({sku: sku, description: description, price: price, quantity: quantity}) {
    this.sku = sku;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
  }
}

class ShoppingCartRepository {
  constructor(store) {
    this.store = store;
  }
  all() {
    return this.store.all();
  }
  findById(id) {
    return this.store.find(id);
  }
  create(cart) { /* … */ }
  update(cart) { /* … */ }
  destroy(cart) { /* … */ }
}
{% endhighlight %}

Here, the `ShoppingCart` is responsible for both queries (`cartItems` and`total()`),
and updates (`addItem()`, `removeItem()`, and normal property setters). The
`ShoppingCartRepository` is used to perform CRUD operations on `ShoppingCart`.

### Shopping cart with CQRS

In CQRS the `ShoppingCart` command model would not have any query methods, only command
methods. For reads, we can create a query model that would be returned by
running a query.

This can simply be a plain JavaScript object.

{% highlight javascript %}
{
  cartId: 123,
  total: 129.95
}
{% endhighlight %}

In this example, let's say we have a `CartTotalStore` that holds
the query models in memory.

{% highlight javascript %}
class CartTotalStore {
  constructor() {
    this.totals = {};
  }
  forCart(cartId) {
    return {
      cartId: cartId,
      total: this.totals[id]
    };
  }
}
{% endhighlight %}

Obviously this would always return `undefined` for now. We'll look at how to
update it later.

We also change the `ShoppingCart` command model to publish Domain Events when
its methods are completed.

{% highlight javascript %}
class ShoppingCart {
  constructor(/* … */) {
    // …
  }
  addItem(cartItem) {
    // …
    DomainEventPublisher.publish('CART_ITEM_ADDED', {
      cartId: this.id,
      sku: cartItem.sku,
      price: cartItem.price,
      quantity: cartItem.quantity
    });
  }
  removeItem(cartItem) {
    // …
    DomainEventPublisher.publish('CART_ITEM_REMOVED', {
      cartId: this.id,
      sku: cartItem.sku,
      price: cartItem.price,
      quantity: cartItem.quantity
    });
  }
}
{% endhighlight %}

Now, in order to execute behaviour on the command model, we must create a command
handler `ShoppingCartCommandHandler` that handles both `AddItemToCart` and
`RemoveItemFromCart` commands.

Note that we are creating a handler that is responsible for multiple commands.
In practice, we may choose to create one handler for each command.

{% highlight javascript %}
class ShoppingCartCommandHandler extends CommandHandler {
  constructor(repo) {
    this.repo = repo;

    // Assumes commands implement subscribe that appends the handler to themselves.
    AddItemToCart.subscribe(this.addItemToCart);
    RemoveItemFromCart.subscribe(this.removeItemFromCart);
  }
  addItemToCart(payload) {
    var cart = this.repo.find(payload.cartId);
    cart.addItem(payload.cartItem); // This publishes a Domain Event
  }
  removeItemToCart(payload) {
    var cart = this.repo.find(payload.cartId);
    cart.removeItem(payload.cartItem); // This publishes a Domain Event
  }
}
{% endhighlight %}

And finally, we must keep our query models updated in our `CartTotalStore`.
To do this, we need it to be an event subscriber that handles Domain Events. Of
course, the handler doesn't necessarily need to be the store, but it makes this
example much simpler.

{% highlight javascript %}
class CartTotalStore {
  constructor() {
    // …
    DomainEventPublisher.subscribeTo('ITEM_ADDED_TO_CART', this.handleItemAdded);
    DomainEventPublisher.subscribeTo('ITEM_REMOVED_FROM_CART', this.handleItemRemoved);
  }
  handleItemAdded({cartId: cartId, cartItem: cartItem}) {
    var total = this.totals[cartId] || 0;
    var newTotal = total + cartItem.price * cartItem.quantity
    this.totals[cartId] = newTotal;
  }
  handleItemRemoved({cartId: cartId, cartItem: cartItem}) {
    var total = this.totals[cartId] || 0;
    var newTotal = total - cartItem.price * cartItem.quantity
    this.totals[cartId] = newTotal;
  }
}
{% endhighlight %}

I hope you now have basic understanding of CQRS. Now we will examine how Flux
relates to CQRS.

## Flux and CQRS

Actions are the Domain Events. Dispatcher is the domain event publisher, and
Stores update themselves based on actions dispatched through the Dispatcher.

ActionCreators are the command handlers. In this case, though, submitting commands
just means calling methods on the ActionCreator.
e.g. `shoppingCartActionCreators.addItem(…)`

