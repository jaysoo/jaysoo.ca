---
created_at: 2015-02-03 15:38Z
layout: post
title: What the Flux?
tags: [javascript, flux, architecture, ddd, cqrs]
---

[Flux](http://facebook.github.io/flux/docs/overview.html) is an application
architecture designed by Facebook for their JavaScript applications. It was
first introduced by Facebook in May 2014, and it has since
garnered much interest in the JavaScript community.

There are several implementations of Flux. Frameworks like [Fluxxor](fluxxor.com)
keep to the original Facebook Flux pattern, but reduces the amount of boilerplate
code. While other frameworks like [Reflux](https://github.com/spoike/refluxjs)
and [Barracks](https://github.com/yoshuawuyts/barracks) stray from the canonical
Flux implementation by getting rid of the Dispatcher (Reflux) or ActionCreators
(Barracks). So which framework should you choose?

Before we get too wrapped up about what is canon, and whether we should be
deviating from them, let's consider a look into the past.

While the Flux pattern may have found a new home in JavaScript applications,
they have been explored before in **Domain-Driven Design** (DDD)
and **Command-Query Responsibility Segregation** (CQRS).  I think it is useful
to learn from these older concepts, and see what they may tell us about the present.

#### In this post I will:

1. Give an overview of the Flux architecture.
1. Present the CQRS pattern.
1. Look at how Flux applies the concepts from CQRS.
1. Close with some thoughts on Flux implementations, and when Flux is needed.

<div class="alert alert-info">
  <p>Knowledge of DDD is assumed, though the article still provides value without it.
  To learn more about DDD, I recommend this <a href="http://www.infoq.com/minibooks/domain-driven-design-quickly">free ebook</a>
  from InfoQ on the subject.</p>

  <p>Examples will be shown in JavaScript, though the language isn't the focus of this post.</p>
</div>

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
result in Actions that are submitted to a centralized Dispatcher. When the Actions
are dispatched, Stores can then update themselves accordingly and notify Views
of any changes. These changes in the Store prompts Views to query for new data.

**INSERT GRAPHIC**

The main difference between MVC and Flux is the separation of queries and updates.
In MVC, the Model is both updated by the Controller *and* queried by the View.
In Flux, the data that a View gets from a Store is read-only. Stores can only be
updated through Actions, which would affect the Stores themselves *not* the
read-only data.

The pattern described above is very close to CQRS as first described by Greg Young.

## Command-Query Responsibility Segregation

To understand CQRS, let's first talk about the object pattern **Command-Query 
Separation** (CQS).

CQS at an object level means:

1. If a method mutates the state of the object, it is a *command*, and it must not return a value.
1. If the method returns some value, it is a *query*, and it must not mutate state.

In normal DDD, Aggregate objects are used for both command and query. We will also
have Repositories that contain methods to find and persist Aggregate objects.

CQRS simply takes CQS further by separating command and query into different objects.
Aggregates would have no query methods, only command methods. Repositories would
now only have a single query method (e.g. `find`), and a single persist method
(e.g. `save`).

In the CQRS pattern, you will find new objects not found in normal DDD.

### The Query Model

The *Query Model* is a pure data model, and is not meant to deliver domain
behaviour. These models are denormalized, and meant for display and reporting.

Query Models are usually retrieved by performing a query. The queries can be
handled by a *Query Processor* that knows how to look up data, say from a database
table.

### Command handling

*Commands* are submitted as the means of executing behaviour on Aggregates. A
command contains the *name* of the behaviour to execute and a *payload*
necessary to carry it out. The submission of a command is received by a *Command Handler*,
which usually fetches an Aggregate from its Repository, and executes a Command
method on it.

As the Command method completes, it publishes a Domain Event. This is crucial
for updating the query model with the most recent changes to the Command Model.

<div class="alert">
  <strong>Note:</strong> Commands are always in imperative tense since they describe behaviours that
  need to be executed (e.g. <code>AddItemToCart</code>). Whereas Domain Events are always
  in past tense since they describe what has already occurred (e.g. 
  <code>'ITEM_ADDED_TO_CART'</code>).
</div>

### Event Subscriber

An *Event Subscriber* receives all Domain Events published by the Command Model.
When an event occurs, it updates the Query Model accordingly. Each event contain
enough information to correctly update the Query Model.

## An example in e-commerce

Let's compare normal DDD with CQRS in the context of an e-commerce system with
a shopping cart.

### Shopping cart with normal DDD

In normal DDD, we may find an Aggregate `ShoppingCart` that contains multiple `CartItems`,
as well as a corresponding Repository.

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
    this.cartItems = cartItems.filter((item) => item.sku !== cartItem.sku);
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

In CQRS the `ShoppingCart` Command Model would not have any query methods, only command
methods. For reads, we can create a Query Model that would be returned by
a lookup.

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

Of course this would always return `undefined` for now. We'll look at how to
update it later.

We also change the `ShoppingCart` Command Model to publish Domain Events when
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

Now, in order to execute behaviour on the Command Model, we must create a Command
Handler `ShoppingCartCommandHandler` that handles both `AddItemToCart` and
`RemoveItemFromCart` Commands.

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

<div class="alert">
  <strong>Note:</strong> We created a handler that is responsible for multiple Commands.
  In practice, we may choose to create one handler for each command.
</div>

And finally, we must keep our Query Models updated in our `CartTotalStore`.
To do this, we need it to be an Event Subscriber that handles Domain Events. Of
course, the handler doesn't necessarily need to be the store, but it makes this
example simpler -- and closer to Flux.

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

You should now have an understanding of CQRS. Next, we will examine how Flux
relates to CQRS.

## Flux and CQRS

Let's see how the different types of object in Flux map to the CQRS pattern.

### Actions

Actions are exactly the same as  Domain Events. They should represent events
that have happened in the past, and will cause updates to Query Models in the system.

### Dispatcher

The Dispatcher is the Domain Event Publisher. It is a centralized place where
Actions are published to. It also allows Stores to subscribe to Actions that
are published in the system.

### Stores

Stores listen for Actions published through the dispatcher, and update themselves
accordingly. In CQRS, they would be the Event Subscriber.

In addition to being the Event Subscribers, they also act as Query Processors.
This is intentionally similar to our implementation of `CartTotalStore`. In some
CQRS systems, however, the Event Subscriber and Query Processor may not be the same
object.

### ActionCreators

ActionCreators are the Command Handlers. In this case, though, submitting Commands
just means calling methods on the ActionCreator. As opposed to having Commands
exist as a separate object.

e.g. `ShoppingCartActionCreators.addItem(…)`

