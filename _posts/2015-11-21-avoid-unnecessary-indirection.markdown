---
created_at: 2015-11-21 20:15Z
layout: post
title: Avoid Unnecessary Indirection
tags: [programming,javascript]
---

In programming, indirection is the ability to hold references to something, as opposed to the value itself.
In object-oriented programming, indirection is used for [dynamic dispatch](https://en.wikipedia.org/wiki/Dynamic_dispatch)
and [delegation](https://en.wikipedia.org/wiki/Delegation_(programming)).

For example, we can use delegation as follows.

{% highlight js %}
class Delegator {
  constructor(delegatee) { this.delegatee = delegatee; }

  doSomething() { return this.delegatee.doSomething(); }
}

const a = {
  doSomething() { console.log('Doing something...'); }
};

const b = new Delegator(a);
b.doSomething(); // Delegates to `a`
{% endhighlight %}

This allows us to change the behaviour of `a.doSomething` depending on the late-bound object `b`.

While indirection is indeed a powerful tool, we should be careful not to overuse it.  I will show what I mean through
an example that I will refactor in steps. Each refactor will strife to make the code cleaner and more maintainable. And finally,
I will do a comparison of the before and after, and see why the "after" may not be the best.

## Example: Traffic Lights

Consider a class that controls traffic lights and their various states.

{% highlight js %}
class TrafficLight {
  constructor(initialState = 'stop') {
    this.state = initialState;
  }

  changeTo(state) {
    this.state = state;
  }

  signal() {
    switch (this.state) {
      case 'stop':
        this.turnOnLamp('red');
        break;
      case 'caution':
        this.turnOnLamp('yellow');
        this.ringWarningBell();
        break;
      case: 'proceed'
        this.turnOnLamp('green');
    }
  }

  nextState() {
    switch (this.state) {
      case 'stop':
        return 'caution';
      case 'caution':
        return 'proceed';
      case 'proceed':
        return 'caution';
    }
  }

  turnOnLamp(color) {
    console.log(`Turning on ${color} lamp`);
  }

  ringWarningBell() {
    console.log('Ring ring ring!');
  }
}
{% endhighlight %}

The `TrafficLight` class has four main responsiblities.

1. Keeps track of the current `state`.
2. Can switch to another state using `changeTo(state)`.
3. Can `signal()` to turn on different lamps, and in some cases may ring a warning bell.
4. Knows what the `nextState()` is given the current state.

Here is an example of usage.

{% highlight js %}
const light = new TrafficLight();

light.state; // 'stop'

light.signal();
// Log: Turning on red lamp

light.nextState(); // 'caution'

light.changeTo('caution');
light.signal();
// Log: Turning on yellow lamp
// Log: Ring ring ring!
{% endhighlight %}

The first **code smell** is that there are switch statements inside `signal` and `nextState`. Why is
`switch` a smell?

Firstly, it makes the method behaviours static, therefore inflexible. This means that if
we ever needed to change their behaviours then we will have to add more `case` blocks, which also
means that we cannot dynamically add or change cases during runtime.

Secondly, the structure of both switch statements look awfully similar. My gut tells me there is a
new abstraction that is screaming to come out.

Let's refactor!

### Refactor #1: Eliminate Switch Statements

The insight here is that we can group the **color** and **next state** data into state objects. Therefore, the responsiblity
of which colored lamp to turn on and the next state is removed from `TrafficLight` (through delegation).

{% highlight js %}
const States = {
  STOP: {
    color: 'red',
    get next() {
      return States.CAUTION;
    }
  },
  CAUTION: {
    color: 'yellow',
    get next() {
      return States.PROCEED;
    }
  },
  PROCEED: {
    color: 'green',
    get next() {
      return States.STOP;
    }
  }
};

class TrafficLight {
  constructor(initialState = States.STOP) {
    this.state = initialState;
  }

  signal() {
    this.turnOnLamp(this.state.color);

    // Still need a special case for ringing warning bell on `caution` state.
    if (this.state === States.CAUTION) {
      this.ringWarningBell();
    }
  }

  nextState() {
    return this.state.next;
  }

  // ...
}
{% endhighlight %}

Looking good so far.

Now, the second **code smell** is the special case of calling `ringWarningBell()` when we are signaling `States.CAUTION`. Let's create a
`State` base class that will handle the special `signal` cases through polymorphism.

### Refactor #2: More Delegation!

The idea here is that we can move all of the signalling logic to the `State` class. This way we can take
further advantage of delegation and keep our `TrafficLight` class nice and clean.

{% highlight js %}
// Base class that provides a default `signal` method.
class State {
  signal(trafficLight) {
    trafficLight.turnOnLamp(this.color);
  }
}

class Stop extends State {
  get color() { return 'red'; }
  get next() { return States.PROCEED; }
}

class Caution extends State {
  get color() { return 'yellow'; }
  get next() { return States.STOP; }

  // Special case is now fully encapsulated in the Caution class.
  signal(trafficLight) {
    super.signal(trafficLight);
    trafficLight.ringWarningBell();
  }
}

class Proceed extends State {
  get color() { return 'green'; }
  get next() { return States.CAUTION; }
}

const States = {
  STOP: new Stop(),
  CAUTION: new Caution(),
  PROCEED: new Proceed()
};

class TrafficLight {
  // ...

  signal() {
    this.state.signal(this);
  }

  // ...
}
{% endhighlight %}

The refactoring so far has reduced `signal` from 11 LOC to 1, and `nextState` from 8 down to 1 LOC. Another
cool part is that a new domain concept has been capture via a new class `State`. Looks good to me!

Or is it?

## Too Much Indirection

If you compare before and after of the `TrafficLight` class, I would argue that the former is much easier to
reason about.

Reasonability of code is an often discussed topic in programming. But what does it actually mean?

Code is easy to **reason about** if its output can be easily predicted given some input. That is, I can
predict what happens without having to expend a lot of effort tracing through it.

For example, [referentially transparent](https://en.wikipedia.org/wiki/Referential_transparency) functions with
[immutable objects](https://en.wikipedia.org/wiki/Immutable_object) are easier to reason about because I don't need to
run through all possible mutations that can occur in the system. I know that given the same input, I will always
get the same output. I also know that the objects I pass into the function cannot be mutated, leading to behaviour changes.

Looking at the `signal()` method from the initial example, I can tell you without much effort what it will do given
the different states. Can I say the same with the final example?

### Scenario: What Happens When I Signal?

Let's step through the same scenario with the initial code, and the final, refactored code.

1. Initial state is `caution` (or `States.CAUTION`).
2. I call `light.signal()`.
3. What happens?


Let's take a look at the initial method in question. Look for the numbers attached to each step below.

{% highlight js %}
class TrafficLight {
  signal() {
    // 1. I know `this.state` is 'caution'...

    switch (this.state) {
      case 'stop':
        this.turnOnLamp('red');
        break;

      // 2. Ah! Here it is.
      case 'caution':

        // 3. Okay, it turns the yellow lamp.
        this.turnOnLamp('yellow');

        // 4. Oh, it rings the warning bell.
        this.ringWarningBell();

        // 5. Case is done.
        break;

      case: 'proceed'
        this.turnOnLamp('green');
    }

    // 6. Done!
  }
}
{% endhighlight %}

Constrast this with the final refactored code. The step numbers are out of order
and might be hard to follow, but this is what happens with indirection in real code. ;)

{% highlight js %}
class TrafficLight {
  // ...

  signal() {
    // 1. I know `this.state` is `States.CAUTION`...

    // 2. I need to look up what `States.CAUTION.signal` does
    this.state.signal(this);

    // 10. Returned from `signal` and I'm done!
  }

  // ...
}

const States = {
  // ...

  // 3. Now I need to look up what Caution class does.
  CAUTION: new Caution()

  // ...
};

class Caution extends State {
  // 7. Oh, the yellow lamp will turn on!
  get color() { return 'yellow'; }

  // ...

  // 4. Ah, here is the signal method!
  signal(trafficLight) {
    //  5. Okay, what does this do? Let me look at State parent class.
    super.signal(trafficLight);

    // ...

    // 8. Now it will ring the warning bell.
    trafficLight.ringWarningBell();

    // 9. Method is done! Let me jump back to `TrafficLight`.
  }
}

class State {
  signal(trafficLight) {
    // 6. Ok, it turns the lamp on... but what color?
    //    I need to go back up the Caution class...
    trafficLight.turnOnLamp(this.color);
  }
}
{% endhighlight %}

The difference in scanning the initial example versus the final one is that the the former
is completely contained in one method, and can be scanned from top to bottom. In the refactored
code, we had to jump all over the place, and keep track of where we have jumped from.

Another thing to note is the the `signal` method of `State` is tightly coupled to the `TrafficLight`
implementation, so we did not create any meaningful abstraction layers either.

Does this mean the refactored code is *necessarily worse*? No, I don't think so. And it's not necessarily
better either. It really depends on the requirements and personal preference. The refactored code might capture
the state transitions and colour requirements in a more cohesive manner. It might increase the ease of extension,
depending on what are are extending.

One thing is for certain, the refactored code is more complex than the original. What might look like clean code
initially (small functions/methods, no switch statements, etc.) might not be desirable.

## Identifying the Necessity of Indirection

Here are a couple of ways to help identify unnecessary or bad indirection.

### Very Tightly Coupled Objects

If you notice that some objects always change together, then it might be a sign that you got the abstractions
wrong the first time around. This can be done by analyzing git log for example.

Sometimes for the sake of keeping code clean and DRY, we introduce the wrong abstractions early on. These bad
abstractions can lead to bugs, and make our code very hard to reason with. If it often better to leave code
duplication alone until you arrive at the insight to refactor properly.

### Too Many Object Interactions

A good abstraction allows you to focus in on the task at hand, without complecting it with all the other
things going on in the system. So if you find yourself constantly having to load a bunch of objects in
your head in order to reason about the system, then it might be another sign that something is amiss.

## Acting On Bad Indirection

Once you've identified bad indirection, the best course of action is usually to undo the damage and inline the code.
Some editors will help you inline your functions, variables, etc., with a quick command.
Once inlined, it is much easier to see the bigger picture.

You can then decide whether you want to refactor further by creating better abstractions.

## Conclusion

Indirection is a valuable tool. When used correctly, it allows us to create powerful abstractions that
allow us to extend and maintain our system more easily. However, like most things of value, indirection
comes at a cost. It increases complexity.

Does this mean we shouldn't use indirection? Of course not! You will not get very far without it. You should
think a bit before refactoring, and make sure you are actually making your code better.

If you end up with unnecessary indirection, don't be afraid to inline your code again. This way you can
more easily reason about your system as a whole. You may then get the insight needed for your next refactor.

Happy coding!

