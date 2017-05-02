---
created_at: 2017-04-30 20:39Z
layout: post
title: "Deconstructing the React Component"
tags: [programming,javascript,react,functional programming]
description: A functional approach to building React applications.
image: /images/5386093672_e14ef0a6df_z.jpg
image_caption: Photo by Mark Sebastian
---

In this three-part series, I want to take a functional approach to building React applications.

There will be mathematical theory sprinkled throughout the series, and hopefully by the end of it you
will pick up some useful techniques!

**Series contents:**

- Part 1 - Deconstructing the React Component
- Part 2 - Read-only context with Reader monad
- Part 3 - Functional state management with Reducer

Functional programming -- category theory in particular -- teaches us a lot about program construction.
Much of the tools that functional programmers reach for are very generalized, and widely applicable to
various domains. It is this *learn once, appy everywhere* idea that I think would appeal to many folks
in the business of making software. (Not to mention that functional programming is fun!)

React has many patterns that grew out of the community. I want to take a step back
and view these patterns from a new angle, and see if we can formalize them with mathematical theory.

You will need basic React knowledge in order to understand this series. I will discuss concepts such as 
[components](https://facebook.github.io/react/docs/components-and-props.html), 
[elements](https://facebook.github.io/react/docs/rendering-elements.html), and 
[higher-order components](https://facebook.github.io/react/docs/higher-order-components.html) (HOC).

If you want to jump ahead a bit, the repository with the final, full examples are on 
[GitHub](https://github.com/jaysoo/example-functional-react). Word of warning though, there isn't much documentation,
so it's probably easier to read the posts. ;)

So let's get started!

## React from first principles

An **element** in React describes what should be rendered in the UI.

{% highlight js %}
const x = <span>Hello World!</span>
{% endhighlight %}

These elements are **immutable** since you cannot modify them after they are created. So what can you do
with immutable elements? Pass them to functions of course!

Let's look at three **pure** functions that take in an element and outputs another element. We say that these functions
are pure because they do not have any observable side-effects -- just *data in*, and *data out*.

{% highlight js %}
const uppercase = element => (
  {% raw %}<span style={{ textTransform: 'uppercase' }}>{element}</span>{% endraw %}

const clap = element => <span>👏 {element} 👏</span>

const emphasize = element => {% raw %}<span style={{ fontStyle: 'italic' }}>{element}</span>{% endraw %}
)
{% endhighlight %}

<div class="alert alert-info">
<p><strong>A bit of theory:</strong> 

The type for an element is <code>React.Element</code>, which are <em>objects</em> in category theory.
Other examples of objects are <code>String</code>, <code>Boolean</code>, etc.</p>

<p>The pure functions <code>uppercase</code>, <code>clap</code>,
and <code>emphasize</code> are <em>morphisms</em> in category theory. A morphism is a mapping between two objects --
in this case <code>React.Element -> React.Element</code>.
</p>
</div>

We can also create computations that allows us to capture data in our elements.

{% highlight js %}
const Greeting = ({ name }) => <span>Hello {name}!</span>
{% endhighlight %}

Nothing fancy here. Just a plain old *functional component* in React. You could render it
via JSX `<Greeting name="Alice"/>`, but I prefer to treat it as a normal function for now
 -- `Greet({ name: 'Alice' })`.

Now we're ready for our first contrived example!

{% highlight js %}
import ReactDOM from 'react-dom'

function contrivedEx(name) {
  const a = Greeting({ name })
  const b = uppercase(a)
  const c = emphasize(b)
  const d = clap(c)
  return d
}

render(contrivedEx('alice'), document.querySelector('#root'))
{% endhighlight %}

This will render "*👏 HELLO ALICE! 👏*" on the screen.

The function `contrivedEx` has two responsibilities:

1. **Run** the computation `Greeting` to get an element out.
2. **Map** the resulting element through multiple functions, then returning the final result.

Let's formalize these two concepts.

## Look at my shiny new box!

We can wrap the original `Greeting` computation in a box, which I will call **View**.

{% highlight js %}
const View = computation => ({
  fold: props => computation(props)
})

// Throw in some computation, and now we have a boxed value`.
const greeting = View(({ name }) => <span>Hello {name}!</span>)
{% endhighlight %}

To get the value out of the box, we just need to *fold* it.

{% highlight js %}
greeting.fold({ name: 'Alice' }) // {% raw %}<span>Hello Alice!</span>{% endraw %}
{% endhighlight %}

As you can see, the `fold` function let's us extract the value out of the box.

Hmm, but now when we want to map over our elements, we have to keep folding it down.

![](/images/1-view-fold.png)

This is very tedious, so let's define a mapping function that can operate on the values within our boxes.

{% highlight js %}
const View = computation => ({
  // I've shortened this since `props => computation(props)` is the same as `computation`
  fold: computation,

  map: f => View(props => f(computation(props)))
})
{% endhighlight %}

The `map` function will return a brand-new box that runs the original computation
through the provided function `f`. Note that `map` is pure a function, and we 
can still maintain a reference to the original box.

{% highlight js %}
const superGreeting = greeting
  .map(uppercase)
  .map(emphasize)
  .map(clap)

superGreeting.fold({ name: 'Alice' }) // {% raw %} <span>👏 <span style={{ fontStyle: 'italic' }}><span style={{ textTransform: 'uppercase' }}><span>Hello Alice!</span></span></span> 👏</span>{% endraw %}

// Our original box is unmodified.
greeting.fold({ name: 'Alice' }) // {% raw %}<span>Hello Alice!</span>{% endraw %}
{% endhighlight %}

All **computations are delayed** until we call the `fold` function. This is a really useful property since we 
can perform multiple transformations without needing to work with concrete values.

We can visualize `map` as follows.

![](/images/2-view-map.png)

The morphisms can operate on values (elements), or we can bring them into the world of boxes (Views)
and map from box to box. You can extract an element at any point by folding it down, but now
we don't have to until we really need it!

<div class="alert alert-info">
<p><strong>A bit of theory:</strong>
The View box that we just create is called a <em>Functor</em> in category theory. You can think of
functors as any object that provides the <code>map</code> function.
</p>

<p>
There are two mathematical laws that functors must obey:

<ol>
<li>Identity: <code>a.map(x => x) === a</code></li>
<li>Composition: <code>a.map(x => f(g(x)) === a.map(g).map(f)</code></li>
</ol>
</p>

<p>
We can use these laws to our advantage when composing applications. For example,
our previous <code>superGreeting</code> view can be optimized by calling <code>map</code>
only once, using the composition <code>compose(clap, emphasize, uppercase)</code>.
</p>
<p>
Because of the composition law, we know that <code>Greeting.map(uppercase).map(emphasize).map(clap)</code>
is identical to <code>Greeting.map(compose(clap, emphasize, uppercase))</code>.
</p>
</div>

While we're at it, let's also make the View a *Pointed Functor* by allowing us to make a *single value* into
a View using the `View.of` function.

{% highlight js %}
View.of = x => View(() => x)

// Folding the view back down from a `View.of` just returns the original element.
View.of(<span>Hello</span>).fold() // <span>Hello</span>
{% endhighlight %}

---

A quick aside on `compose`. I'm using a library called [Ramda](ramdajs.com/docs) that provides a lot of
utilities for functional programming, include `compose`. The composition is applied from right-to-left,
so `f(g(x))` is the same as `compose(f, g)(x)`. The mathematical symbol "∘" also denotes a composition --
.e.g. `f ∘ g === compose(f, g)`.

---

Okay, moving on!

## Formalizing higher-order component concepts

So, isn't the `View` box kind of like higher-order components (HOC)? Which we already have in "normal" React.

{% highlight js %}
// Normal React HOC
const red = Component => () => {% raw %}<span style={{ color: 'red' }}><Component/></span>{% endraw %}

// A map in our view
const red2 = view => view.map(x => {% raw %}<span style={{ color: 'red' }}>{x}</span>{% endraw %})
{% endhighlight %}

Here, we have two functions that when given a component or view,
returns something that is like the original input, but in red.

The difference between the HOC and the View is that the latter formalizes the concept of
mapping its value through the `map` function.

But wait, there is something that HOCs can do that Views cannot (yet).


For example,

{% highlight js %}
const withColor = color => Component => props => (
  <Component {...props} color={color}/>
)
{% endhighlight %}

The `withColor` HOC takes a color (e.g. `red`, `#fff`, `rgb(0,0,0)`, etc.), *then* a component
that uses the `color` prop, and *then* returns a component that is the original, but with the
`color` prop already provided.

{% highlight js %}
const Color = ({ color }) => (
  {% raw %}<span style={{ color }}>{color}</span>{% endraw %}
)
const Red = withColor('red')(Color)

<Red/> // {% raw %}<span style={{ color: 'red' }}>red</span>{% endraw %}
{% endhighlight %}

Whereas the `red` HOC is mapping over the resulting *value*, the `withColor` HOC is mapping
over the *input* props. And since `view.map` maps over the value (element), there is no chance for us
to map over the original input to a view's computation.

So is there anything we can do?

Of course! We just need to formalize this new concept.

## Mapping over inputs

Remember that the View wraps a computation defined as `Props -> Element`.  Let's take a look
at a concrete example with our previous color computation.

{% highlight js %}
const color = View(({ color }) => (
  {% raw %}<span style={{ color }}>{color}</span>{% endraw %}
))

color.fold({ color: 'blue' }) // {% raw %}<span style={{ color: 'blue' }}>blue</span>{% endraw %}
{% endhighlight %}

Here, we have `Props` that is some data that contains color, and `Element` is the
resulting `<span>` based on the color passed in.

What we want to do now, is to map over the input props before passing them into the computation.
This can be done by defining a nifty new function called `contramap`.

{% highlight js %}
const View = computation => ({
  fold: computation,
  
  map: f =>
    View(props => f(computation(props)))

  contramap: g =>
    View(props => computation(g(props)))
})
{% endhighlight %}

Note that with `map` we call `f` with the resulting value, but with `contramap`
we call `g` with the input props, and then *that* result is passed to the computation as input.

So, with our new function, we can do the following.

{% highlight js %}
const blue = color.contramap((props) => ({ ...props, color: 'blue' }))

blue.fold() // {% raw %}<span style={{ color: 'blue' }}>blue</span>{% endraw %}
{% endhighlight %}

Awesome! We can now map over results and contramap over inputs!

<div class="alert alert-info">
  <p><strong>A bit of theory:</strong>
  The View is now also a <em>Contravariant</em>, in addition to being a functor. You can think of
  contravariants as any object that provides the <code>contramap</code> function.
  </p>

  <p>
  And just like functors, contravariants also have similar mathematical laws:

  <ol>
  <li>Identity: <code>a.contramap(x => x) === a</code></li>
  <li>Composition: <code>a.contramap(x => f(g(x)) === a.contramap(f).contramap(g)</code></li>
  </ol>
  </p>

  <p>
  The main difference between <code>map</code> and <code>contramap</code> is that composition
  with the latter is reversed. We can visualize the difference with these two pictures</p>

  <div style="display: flex; justify-content: center; align-items: center; text-align: center">
    <p style="flex: 1">
    <strong>Functor composition</strong><br/>
    <img src="/images/3-map-composition.png"/>
    </p>
    <p style="flex: 1">
    <strong>Contravariant composition</strong><br/>
    <img src="/images/4-contramap-composition.png"/>
    </p>
  </div>
</div>

### No need for HOCs

Now that we've captured both `map` and `contramap` use cases of HOCs, we no longer need them! We only need to consider
whether we are mapping over result or input to decide whether we want `map` or `contramap`.

By formalizing these concepts we can be more explicit and precise about *what* we are mapping over, and *how* we are mapping.
Additionally, we have mathematical laws to help us compose our program, which is awesome!


## Quick Recap

So far we've seen how we can:

1. Put a computation of the form `Props -> Element` into a box (View).
2. Take the value out via `fold`.
3. Map over the resulting element via `map`.
4. Map over the input props via `contramap`.

But what if we want to combine multiple Views together?

## Combining multiple boxes

Let's step back from the world of React for a bit and consider an array.

{% highlight js %}
const a = [1]
const b = [2]
const c = [3]
{% endhighlight %}

We can see that arrays are functors since they implement a `map` function that
obeys the functor laws -- you can verify this for yourself!

But arrays have something our View does not: a way to combine two arrays into a new array.

{% highlight js %}
a.concat(b).concat(c) // [1, 2, 3]
{% endhighlight %}

So let's add this `concat` function to our View.

{% highlight js %}
const View = computation => ({
  fold: computation,
  
  map: f =>
   View(props => f(computation(props)))

  contramap: g =>
   View(props => computation(g(props))),

  // Borrowed from Brian Lonsdord's talk Oh Composable World
  // See: https://youtu.be/SfWR3dKnFIo?t=21m51s
  concat: other =>
    View(props => (
      <div>
        {computation(props)}
        {other.fold(props)}
      </div>
    ))
})
{% endhighlight %}

<div class="alert alert-info">
  <p><strong>A bit of theory:</strong>
    The View is now also a <em>Semigroup</em>, which are objects that provide the <code>concat</code> function.
  </p>

  <p>
  Semigroups have one law:

  <ol>
  <li>Associativity: <code>(a.concat(b)).concat(c) === a.concat(b.concat(c))</code></li>
  </ol>
  </p>

  <p>
    Note, that View doesn't <em>technically</em> obey the associativity law since the ordering of the nested <code>div</code>s are different.
    We will correct this later on in this post, but for now let's say that <code>concat</code> ordering is not affecting how the combined View <em>appears</em> on the screen.
  </p>
</div>

And now we can `concat` like a boss!

{% highlight js %}
const header = View.of(<h1>Awesome App</h1>)
const greeting = View(({ name }) => <p>Hello {name}!</p>)
const footer = View.of(<p>© Bob McBob 2017</p>)

const main = header.map(x => {% raw %}<header style={{ color: 'red' }}>{x}</header>{% endraw %})
  .concat(greeting.contramap(() => ({ name: 'Alice' })))
  .concat(footer.map(x => {% raw %}<footer style={{ color: 'blue' }}>{x}</footer>{% endraw %}))

const centered = main.map(x => {% raw %}<div style={{ textAlign: 'center' }}>{x}</div>{% endraw %})

ReactDOM.render(
  centered.fold(),
  document.querySelector('#root')
)
{% endhighlight %}

Yes, the `map` and `contramap` are a bit gratuitous... But, if you run the program, you should see this.

![](/images/5-awesome-app.png)

## Let's fix the associativity problem for semigroup

Remember that our View currently doesn't obey associativity, because `(a.concat(b)).concat(c)` will not
generate the same markup as `a.concat(b.concat(c))`.

For example:

{% highlight js %}
// Given
const a = View.of(<a>A</a>)
const b = View.of(<a>B</a>)
const c = View.of(<a>C</a>)

a.concat(b).concat(c).fold()   // === <div><div><a>A</a><a>B</a></div><a>C</a></div>
a.concat(b.concat(c)).fold()   // === <div><a>A</a><div><a>B</a><a>C</a></div></div>
{% endhighlight %}

We can fix this by making sure that the computation results in something that's already a semigroup. In this case,
we can use an array.

Let's define a function that will adapt the result as an array if it isn't one already.

{% highlight js %}
const asArray = x => (Array.isArray(x) ? x : Array.of(x))
{% endhighlight %}

Now, we can compose the View with the new `asArray` function, thus guaranteeing that the computation
always results in an array.

{% highlight js %}
// The `pipe` function here is the same as compose but composition is applied in reverse (left-to-right).
// You can find this function in your friendly Ramda module!
const View = pipe(
  x => compose(asArray, x),
  computation => ({
    // ...
  })
)
{% endhighlight %}

We also have to modify our previously defined functions slightly to work with an array rather than a single value.

{% highlight js %}

const View = pipe(
  x => compose(asArray, x),
  computation => ({
    computation: computation, // Need this later on.

    // Redefine `fold` to wrap multiple children in a parent <div>.
    // However, if there is only one child, then just return it without wrapping.
    fold: props => {
      // Filter out nulls, which will come in handy soon!
      const result = computation(props).filter(x => x !== null)

      // If we only have one element to render, don't wrap it with div.
      // This preserves the view's root element if it only has one root.
      // e.g. View.of(<div/>).fold() is just <div/>
      if (result.length === 1) {
        return result[0]
        // If the computation results in multiple items, then wrap it in a
        // parent div. This is needed because React cannot render an array.
        // See: https://github.com/facebook/react/issues/2127
      } else {
        return createElement('div', { children: result })
      }
    },

    // Since the computation results in an array, we can map it with `f`.
    map: f => View(x => computation(x).map(f)),


    // Contramap is invoked on input props (not results),
    // so we don't have to change anything.
    contramap: g => View(x => computation(g(x))),

    // Now our `concat` is just array concat. Simple!
    concat: other =>
      View(props => computation(props).concat(other.computation(props)))
  })
)
{% endhighlight %}

Indeed, we can verify that the associativity law now holds.

{% highlight js %}
const a = View.of(<div>a</div>)
const b = View.of(<div>b</div>)
const c = View.of(<div>c</div>)

a.concat(b).concat(c).fold() // === <div><a>A</a><a>B</a><a>C</a></div>
a.concat(b.concat(c)).fold()   // === <div><a>A</a><a>B</a><a>C</a></div>
{% endhighlight %}

---

Just for fun, we can also make View a *Monoid* by providing an `empty` function.

{% highlight js %}
View.empty = View.of(null)
{% endhighlight %}

<div class="alert alert-info">
  <p><strong>A bit of theory:</strong> 
  The View is now a <em>Monoid</em>, and it provides the <code>View.empty</code> function that has the 
  following laws.

  <ol>
  <li>Right identity: <code>a.concat(A.empty()) === a</code></li>
  <li>Left identity: <code>A.empty().concat(a) === a</code></li>
  </ol>
</p>
</div>

Remember how we filtered out `null` values that result from the computation? This is why the right
and left identity laws hold. Otherwise, React will generate HTML comments for `null` children, thus resulting
in different markup.

---

## Summary

Phew! I think this is a good stopping point for this post. Let's see what we've done so far.

1. We added a new "box" called View that holds a computation to generate a React element.
2. We added a `fold` function that extracts a value out of the box.
3. We added a `map` function that maps over the value in the box.
4. We added a `contramap` function that maps over the input in the box.
5. We added a `concat` function that combines two boxes together.

And along the way we learned about **Functors**, **Contravariants**, **Semigroups**, and **Monoids**.

But we are not done yet since our View still hasn't recreated two key features of React components:
*context* and *state*.

In the next post, we will replicate the React context using the Reader monad. So stay tuned!

But you're dying for more functional programming content like this, I can recommend the following:

- [Functional Programming Jargon](https://github.com/hemanth/functional-programming-jargon)
- [Functors, Applicatives, And Monads In Pictures](http://adit.io/posts/2013-04-17-functors,_applicatives,_and_monads_in_pictures.html) by Aditya Bhargava
- [Oh Composable World!](https://www.youtube.com/watch?v=SfWR3dKnFIo) (video) by Brian Lonsdorf
- [Professor Frisby Introduces Composable Functional JavaScript](https://egghead.io/courses/professor-frisby-introduces-composable-functional-javascript) (course) by Brian Lonsdorf
- Brian Lonsdorf on [Medium](https://medium.com/@drboolean) and [Twitter](https://twitter.com/drboolean)
