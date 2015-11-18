---
created_at: 2015-11-16 20:15Z
layout: post
title: When Clean Code Isn't Clean
tags: [programming,javascript]
---



## Traffic Lights

Consider a class that controls a traffic light.

{% highlight js %}
class TrafficLight {
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

Here's an example of usage:

{% highlight js %}
const light = new TrafficLight();

light.changeTo('stop');
light.signal();
// Log: Turning on red lamp

light.nextState(); // 'caution'

light.changeTo('caution');
light.signal();
// Log: Turning on yellow lamp
// Log: Ring ring ring!
{% endhighlight %}

The first code smell we see is that we are using two switch statements inside `signal` and `nextState`. Let's replace it using objects.

### Refactor #1 - eliminating switch statements

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
  changeTo(state) {
    this.state = state;
  }

  signal() {
    this.turnOnLamp(this.state.color);
    if (this.state === States.CAUTION) {
      this.ringWarningBell();
    }
  }

  nextState() {
    return this.state.next;
  }

  turnOnLamp(color) {
    console.log(`Turning on ${color} lamp`);
  }

  ringWarningBell() {
    console.log('Ring ring ring!');
  }
}
{% endhighlight %}

{% highlight js %}
const light = new TrafficLight();

light.changeTo(States.CAUTION);
light.signal();
// Log: Turning on yellow lamp
// Log: Ring ring ring!
{% endhighlight %}

The only issue now is the special case of calling `ringWarningBell()` when we are signaling `States.CAUTION`. Let's create a
`State` base class that will handle the special `signal` cases through polymorphism.

### Refactor #2 - polymorphic dispatch

The idea here is that we will delegate all of the signalling logic to the `State` object. This way we can take
advantage of polymorphic dispatch and keep our `TrafficLight` class clean.

{% highlight js %}
class State {
  signal(trafficLight) {
    trafficLight.turnOnLamp(this.color);
  }
}

class Stop extends State {
  get color() { return 'red'; }
  get next() { return new Proceed(); }
}

class Caution extends State {
  get color() { return 'yello'; }
  get next() { return new Stop(); }

  signal(trafficLight) {
    super.signal(trafficLight);
    trafficLight.ringWarningBell();
  }
}

class Proceed extends State {
  get color() { return 'green'; }
  get next() { return new Caution(); }
}

const States = {
  STOP: new Stop(),
  CAUTION: new Caution(),
  PROCEED: new Proceed()
};

class TrafficLight {
  changeTo(state) {
    this.state = state;
  }

  signal() {
    this.state.signal(this);
  }

  nextState() {
    return this.state.next;
  }

  turnOnLamp(color) {
    console.log(`Turning on ${color} lamp`);
  }

  ringWarningBell() {
    console.log('Ring ring ring!');
  }
}
{% endhighlight %}

The second refactor reduces `signal` from 11 LOC to 1, and `nextState` from 8 down to 1 LOC. We've also
captured a another domain concept in a new class: `State`. Looks pretty good!

Or is it?

###


