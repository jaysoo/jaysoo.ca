---
created_at: 2016-01-03 12:50Z
layout: post
title: Managing Side Effects In React + Redux Using Sagas
tags: [programming,javascript,redux,flux,react]
---

[Redux](https://github.com/rackt/redux/) is a Flux-like framework that has exploded in
popularity within the React community. It reduces complexity by enforcing a unidirectional
data flow, the use of single state atom, and pure reduce functions for state updates.

For me, there has always been one thorn in the React+Flux setup, which is that more
complicated processes involving **coordination of action creators and side-effects** are **hard to handle**.
Solutions using component lifecycle methods (`componentDidUpdate`, `componentWillUpdate`, etc.), and action creators
returning [thunks](https://github.com/gaearon/redux-thunk) do work, but they seem out of place
in certain situations.

To illustrate what I mean, let's take a look at a simple **Timer** app. Note, the source code of the full solution
can be found [here](https://github.com/jaysoo/example-redux-saga).

## The Timer App

This app will allow users to *start* and *stop* a timer, as well as provide the ability to *reset* it.

![](/images/timer-app.png)

We can think of the app as a finite state machine that transitions between two states:
**Stopped** and **Running** (as shown in the simplified diagram below). While the timer is in
Running state, it will update the timer every *1 second*.

![](/images/timer.svg)

So let's go over the basic app setup first, then I'll show how *sagas* can help manage side-effects
using processes outside of action creators and components.

### Actions

There are four [actions](https://github.com/jaysoo/example-redux-saga/blob/master/src/timer/actions.js) in our module.

1. `START` - Transitions the timer to Running state.
2. `TICK` - Increments the timer on each tick.
3. `STOP` - Transitions the timer to Stopped state.
4. `RESET` - Resets the timer back to zero.

{% highlight js %}
// actions.js

export default { start: () => ({ type: 'START' })
               , tick: () => ({ type: 'TICK' })
               , stop: () => ({ type: 'STOP' })
               , reset: () => ({ type: 'RESET' })
               };
{% endhighlight %}

### State Model and Reducer

The timer state consists of two properties: `status` and `seconds`.

{% highlight js %}
type Model = {
  status: string;
  seconds: number;
}
{% endhighlight %}

Where `status` is one of `Running` or `Stopped`, and `seconds` is the accumulated seconds count
since the timer has started.

Then the [reducer](https://github.com/jaysoo/example-redux-saga/blob/master/src/timer/reducer.js) is implemented as follows.

{% highlight js %}
// reducer.js

const INITIAL_STATE = { status: 'Stopped'
                      , seconds: 0
                      };

export default (state = INITIAL_STATE, action = null) => {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'Running' };
    case 'STOP':
      return { ...state, status: 'Stopped' };
    case 'TICK':
      return { ...state, seconds: state.seconds + 1 };
    case 'RESET':
      return { ...state, seconds: 0 };
    default:
      return state;
  }
};
{% endhighlight %}

### Timer View

The view is straight-forward if we keep it side-effect free. It renders the current time
and status, and also invokes corresponding callback functions when the user clicks
on Reset, Start, or Stop buttons.

{% highlight js %}
export const Timer = ({ start, stop, reset, state }) => (
  <div>
    <p>
      { getFormattedTime(state) } ({ state.status })
    </p>
    <button
      disabled={state.status === 'Running'}
      onClick={() => reset()}>
      Reset
    </button>
    <button
      disabled={state.status === 'Running'}
      onClick={() => start()}>
      Start
    </button>
    <button
      disabled={state.status === 'Stopped'}
      onClick={stop}>
      Stop
    </button>
  </div>
);
{% endhighlight %}

## Problem: How to Handle Periodic Updates?

The app can now transition between Running and Stopped states, but there isn't a mechanism for scheduling
periodic updates to the timer.

In a typical Redux+React app, there are two ways we can handle the updates.

1. The view can call the action creator periodically.
2. The action creator can return a thunk that will dispatch `TICK` actions periodically.

### Solution 1: Letting View Dispatch Updates

For #1, the view will have to wait for state to transition from Stopped to Started, and then
start the periodic dispatches. This means we have to use a stateful component.

{% highlight js %}
class Timer extends Component {
  componentWillReceiveProps(nextProps) {
    const { state: { status: currStatus } } = this.props;
    const { state: { status: nextStatus } } = nextProps;

    if (currState === 'Stopped' && nextState === 'Running') {
      this._startTimer();
    } else if (currState === 'Running' && nextState === 'Stopped') {
      this._stopTimer();
    }
  }

  _startTimer() {
    this._intervalId = setInterval(() => {
        this.props.tick();
    }, 1000);
  }

  _stopTimer() {
    clearInterval(this._intervalId);
  }

  // ...
}
{% endhighlight %}

This does work, but it makes our view **stateful and impure**. Another problem is that our component is now responsible for more than
just rendering HTML and capturing user interaction. It now causes side-effects, which makes the view and application as a whole harder
to reason about. This may not be a huge deal in a small app such as this one, but in a larger application you want to keep
side-effects at the boundaries of the system.

So what about using thunks?

### Solution 2: Using Thunks in Action Creator

An alternative to the view approach is to use [thunks](https://github.com/gaearon/redux-thunk) in our action creator. We can change the `start` action
creator to the following.

{% highlight js %}
export default {
  start: () => (
    (dispatch, getState) => {
      // This transitions state to Running
      dispatch({ type: 'START' });

      // Check every 1 second if we are still Running.
      // If so, then dispatch a `TICK`, otherwise stop
      // the timer.
      const intervalId = setInterval(() => {
        const { status } = getState();

        if (status === 'Running') {
          dispatch({ type: 'TICK' });
        } else {
          clearInterval(intervalId);
        }
      }, 1000);
    }
  )
  // ...
};
{% endhighlight %}

The start action creator will now dispatch a `START` action as soon as it is invoked. Then, a `TICK` action
is dispatched every 1 second, as long as the timer is still Running.

The issue I have with this approach is that the action creator is doing too much. It is also
harder to test this action creator because it is no longer just returning data.

## Better Solution: Using Sagas to Manage the Timer

The project [redux-saga](https://github.com/yelouafi/redux-saga) reifies side effects into artifacts called
*Effects*. The Effects can be generated by another artifact called *Sagas*. The concept of sagas, as far as
I know, comes from the world of CQRS and Event Sourcing. There
[are some debates](https://groups.google.com/forum/#!msg/dddcqrs/_c7rxQUrZTE/SPaDC9CJF_YJ) on what sagas
are, but you can think of them as **long-live processes** that interacts with the system by:

1. Reacting to actions dispatched in the system.
2. Dispatches new actions into the system.
3. Can "wake itself" using internal mechanisms without actions being dispatched. e.g. waking up on interval

In redux-saga, a saga is a generator function that can run indefinitely inside the system. It can be woken up
when a specific action is dispatched. It can dispatch additional actions, and has access to the application state atom.

For example, if we want to dispatch periodic `TICK`s whenever the timer is Running, we can do the following.

{% highlight js %}
function* runTimer(getState) {
  // The sagasMiddleware will start running this generator.

  // Wake up when user starts timer.
  while(yield take('START')) {
    while(true) {
      // This side effect is not run yet, so it can be treated
      // as data, making it easier to test if needed.
      yield call(wait, ONE_SECOND);

      // Check if the timer is still running.
      // If so, then dispatch a TICK.
      if (getState().status === 'Running') {
        yield put(actions.tick());
      // Otherwise, go idle until user starts the timer again.
      } else {
        break;
      }
    }
  }
}
{% endhighlight %}

As you can see, a saga uses normal JavaScript control flow constructs to coordinate
side-effects and action creators. The `take` function wakes the saga up when the `START` action
is dispatched. The `put` function causes the new `TICK` actions to be dispatched. And the `call` function
allows us model the wait effect in a structure that does not cause it to run -- similar to a [Task](https://github.com/folktale/data.task).

By using a saga, we are able to keep our view and action creators as pure functions. It also allows
us to model state transitions using familiar JavaScript constructs.

## Wrap Up

Sagas are a way to manage side-effects within the system. They are a good fit when you need a
long-running process that coordinates multiple action creators and side-effects.

Sagas react to actions, as well as internal mechanisms (e.g time-based effects).
They are especially useful when you need to manage side-effects outside of the normal Flux workflow. For example,
a user interaction could lead to further actions that do not require further interaction from the user.

Lastly, whenever you can model your solution as a finite state machine, sagas are worth a try.

If you want to see the full source code of the Timer app, see the [repository here](https://github.com/jaysoo/example-redux-saga).

Have you tried using sagas yet? What are your thoughts?

