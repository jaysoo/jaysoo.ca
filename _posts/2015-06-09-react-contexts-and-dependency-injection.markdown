---
created_at: 2015-06-09 22:35Z
layout: post
title: React Contexts and Dependency Injection
tags: [javascript,react]
---

In this post I want to explore the idea of using *contexts* in React to
implement *[dependency injection](http://en.wikipedia.org/wiki/Dependency_injection)* (DI)
in our application. 

We'll cover two things:

1. What contexts are in React and how they work
2. Why we care about DI and how we can implement them using contexts.

## React and Contexts

Contexts were formalized in React 0.12, and are planned for React 1.0. They
are a mechanism for a component to pass properties down to their descendent components.
The difference between `props` and `context` is that `context` chains to descendents,
whereas `props` do not.

Let's take a look at a small example.

{% highlight js %}
import React, { PropTypes } from 'react';

class Parent {
  static childContextTypes = {
    get	User: PropTypes.func
  };
  
   getChildContext() {
    return {
      getUser: () => ({ name: 'Bob' })
    };
  }
  
  render() {
    return <Child />;
  }
}

class Child {
  render() {
    return <GrandChild />;
  }
}

class GrandChild {
  static contextTypes = {
    getUser: PropTypes.func.isRequired
  };
  
  render() {
    const user = this.context.getUser();
    return <p>Hello {user.name}!</p>;
  }
{% endhighlight %}

In our `Parent` component, we implement two things:

1. The `childContextTypes` static property, which specifies the propeties that
   this component will provide to its descendent components.
2. The `getChildContext()` method, which returns the concrete values for the
   context.
   
 Our `GrandChild` component implements the `contextTypes` static property, which
 specifies what will be on its context (accessible via `this.context`).
 
 This is powerful because we decoupled `GrandChild`'s dependency on a user service to our
 containing component (`Parent` in this case).
 
<div class="alert alert-info">
  <strong>Note:</strong> The <code>Child</code> component does not need to chain the context
  down to <code>GrandChild</code>. This is different from <code>props</code> where we would need
  to manually chain all properties down.
</div>

## Dependency Injection

Dependency injection is a pattern that implements the [Inversion of Control](http://en.wikipedia.org/wiki/Inversion_of_control) design.

In recent years it has gained more mindshare with frontend developers due to the popularity of the 
[AngularJS](http://angularjs.org) framework.

The value of DI is that we can depend on abstract ideas instead of concrete implementations.
This makes our code much more testable and increases reusability -- we'll see this later.

### Example: Random Number Generator

Let's imagine a component `RandomNumber` that renders a randomly generated integer between 1 and `max`.

{% highlight js %}
class RandomNumber {
  static propTypes = { max: PropTypes.number };
  
  getDefaultProps() {
    return { max: 100 };
  }
  
  render() {
    const num = Math.round(Math.random() * this.props.max);
    return <p>Number: {num}</p>;
  }
}
{% endhighlight %}

The current implementation couples the component to two functions: `Math.round` and `Math.random`. This
coupling makes testing impossible, and also makes it impossible to reuse if our random number provider changes.

#### Using Contexts

Let's see how the same component looks using contexts.

{% highlight js %}
class RandomNumber {
  // Specify our dependencies.
  static contextTypes = {
    random: PropTypes.func.isRequired,
    round: PropTypes.func.isRequired 
  };
   
  static propTypes = { max: PropTypes.number };
  
  getDefaultProps() {
    return { max: 100 };
  }
  
  render() {
    const { random, round } =  this.context;
    const num = round(random() * this.props.max);
    return <p>Number: {num}</p>;
  }
}
{% endhighlight %}

This makes **testing** very easy because we now control exactly what `random` and `round` return
to our component.

{% highlight js %}
describe('RandomNumber', () => {
  // The context we want to return. We will rebind this in tests.
  let context;
   
  // Test container to provide dependencies.
  class Container {
    static childContextTypes = {
      random: PropTypes.func,
      round: PropTypes.func 
    };

    getChildContext() { return context }

    render() {
      return <div>{this.props.children()}></div>
    }
  }
  
  it('renders number from 1 to max', () => {
    let component, p;
    context = { round: Math.round }; // Binding context.
  
    context.random =  () => 0.9999; // Hard-coded to return 0.9999
    component = TestUtils.renderIntoDocument(
      <Container>{() => <RandomNumber max={10} />}</Container>
    );
    expect(React.findDOMNode(component).textContent).to.match(/10/);
    
    context.random = () => 0.499999;
    component = TestUtils.renderIntoDocument(
      <Container>{() => <RandomNumber max={5000} />}</Container>
    );
    expect(React.findDOMNode(component).textContent).to.match(/2500/);
  });
});
{% endhighlight %}

We have also increased **reusability** of our component by allowing late-binding of the `random` and `round`
functions. If we wanted to provide different rounding strategies we will be able to -- say rounding
to two decimal places. We can also swap out `Math.random` with a better number generator if needed and
we will not need to touch `RandomNumber`'s implementation.

### Generalization

We can extend our random number generator example to all services. In the context of **Flux**, we can use
DI for Stores and ActionCreators so that our components are completely decoupled from concrete types.


{% highlight js %}
class AppContainer {
  static childContextTypes = {
    userActionCreators: PropTypes.object,
    userStore: PropTypes.object
  };
  
  getChildContext() {
    return {
      // ...
    };
  } 
  
  render() {
    // ...
  }
}

// ... Somewhere deep in our application
class UserAvatar {
  static contextType = { userStore: PropTypes.object.isRequired };
  render() {
    const user = this.context.userStore.getUser();
    return <img src={user.avatarUrl} />;
  }
}

// ... Somewhere else
class UserLogout {
  static contextType = { userActionCreators: PropTypes.object.isRequired };
  render() {
    const logout = this.context.userActionCreators.logout;
    return <a onClick={logout}>Log out</a>;
  }
}
{% endhighlight %}

### Taking It Up A Notch

With [ES7 decorators](https://github.com/wycats/javascript-decorators), we can create even
nicer abstractions for DI in React.

Let's take a look at two decarators:

1. `@inject` - sets the  `contextTypes` on our component.
2. `@provide` - defines `childContextTypes` on our component and binds the context.

{% highlight js %}
const inject = (injectables) => {
  return (Component) => {
    Component.contextTypes = Object.entries(injectables)
      .reduce((contextTypes, [k, v]) => {
        contextTypes[k] = v.type;
        return contextTypes;
      }, {});

    return class {
      render() {
        return <Component {...this.props} />;
      }
    };
  };
};

const provide = (providing) => {
  return (Component) => class {
    static childContextTypes = Object.entries(providing)
    .reduce((contextTypes, [k, v]) => {
      contextTypes[k] = v.type;
      return contextTypes;
    }, {});

    getChildContext() {
      return Object.entries(providing).reduce((contextTypes, [k, v]) => {
        contextTypes[k] = v.value.call(this);
        return contextTypes;
      }, {});
    }

    render() {
      return <Component {...this.props} />;
    }
  };
};
{% endhighlight %}

If we go back to our earlier `AppContainer` and `UserAvatar` code, here's how we can use the new decorators
in our application.

{% highlight js %}
@provide({
  userActionCreators: {
    type: PropTypes.object,
    value() {
      return /* ... */;
    }
  },
  userStore: {
    type: PropTypes.object,
    value() {
      return /* ... */;
    }
  }
})
class AppContainer {
  render() {
    // ...
  }
}

// ... Somewhere deep in our application

@inject({
  userStore: { type: PropTypes.object.isRequired }
})
class UserAvatar {
  render() {
    const user = this.context.userStore.getUser();
    return <img src={user.avatarUrl} />;
  }
}
{% endhighlight %}

This is using a concept called *[higher-order components](https://gist.github.com/sebmarkbage/ef0bf1f338a7182b6775)* (HoC).
Basically, we use functions (decorators) that take in a component as input and ouputs a component. This allows
us to add additional behaviour or metadata to the original component.

## Wrap-Up

In this post we saw how **dependency injection** can be achieved in React through the use of **contexts**.

We saw how dependency injection can make our code more testable and more reusable.

### Further Readings

- [Introduction to Contexts in React](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html) by Dave King
