---
created_at: 2016-01-12 22:56Z
layout: post
title: The Little Idea of Functional Programming
tags: [functional programming,javascript,react]
---

A little known fact about me is that I took [Wing Chun](https://en.wikipedia.org/wiki/Wing_Chun)
lessons for four months back in 2006. A student starting in Wing Chun will begin by learning
the first form, called *Siu Lim Tao* (小練頭). This form's name translates to "little idea,"
and it provides the foundation in which succeeding forms and techniques depend upon.

I've spent a lot of time thinking about the *little ideas* behind the art of programming.
In particular, the topic of **functional programming** keeps cropping up every once in a while.
Some people love it, some people hate it, while others just have no idea what functional programming
is all about.

When you ask people about functional programming, you might hear jargons like *monads*, *morphisms*, or *semigroups*.
Others may say functional programming is all about *map-filter-reduce*. And you may also hear talks about *purity*,
and *side effects*.

What I want to do in this post is to take a look at a couple of simple concepts that make up the **little idea
behind functional programming**. I will tie the concepts back to code examples in JavaScript. There will
be some ReactJS code, so some familiarity with it helps, although not necessary.

Also, a big shoutout to [Brian Lonsdorf](https://twitter.com/drboolean) for his
[Class Coding with Prof. Frisby](https://www.youtube.com/watch?v=h_tkIpwbsxY&list=PLK_hdtAJ4KqX0JOs_KMAmUNTNMRYhWEaC&index=1)
video series, which inspired the code examples in this post.

## Implementing YouTube instant search

Before we begin exploring functional programming concepts, let's take a look at our sample problem - a
YouTube search.

The YouTube search app will allow the user to type in search terms into an input box. As
the user types, video results will appear below the input box.

![](/images/fp-youtube.gif)

OK, now we are ready to begin!

## The Little Idea

There are three concepts that capture the essence of functional programming.

1. Data in, data out

2. Code as data

3. (Function) Composition all the way down

Other functional programming concepts and techniques can be built upon this *little idea*.

### Concept #1 - Data in, data out

The first concept is the **separation of data and behaviour**. Data by themselves cannot do anything, but
functions can be used to take them in as input and then output some new data. You can picture
a function as a box that take in some shape, and spits out another.

![](/images/comp-1.svg)

In the illustration above, function *f* takes a triangle as input, and outputs a square. Function
*g* takes in a square and outputs a circle.

When working with data in, data out, it is important to enforce function *purity*. A function is pure
if its output is solely determined by its input. That is, given the same input, it must always return
the same output. Furthermore, a pure function must not have any side effects. An effect is something like
writing to database, changing a global variable, or throwing exceptions.

With this idea in mind, we can implement a couple of functions to be used in our app.


#### Code - Mapping search term to URL

As the user is typing into the input box, we need a way to use that value
and transform it to an URL to fetch the results.

Here, we take in a `String` as input, and ouput an `Url`. Note that `Url` is simply an alias
for `String` but has better semantics.

{% highlight js %}
// this type alias will only work if you use TypeScript or FlowType
type Url = String;

// makeUrl :: String -> Url
const makeUrl = (term) =>
  `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&type=video&q=${term}&key=xxxx`; // xxxx is the Google API key
{% endhighlight %}

Now that we can map the user's input value to an URL, we can fetch an API call to fetch the response JSON.
So let's look at the `VideoJSON` object, and think about how we can build `Video` objects from them.

#### Code - Hash to Video

The YouTube API returns a `VideoJSON` as follows.

{% highlight js %}
{
  "id": {
    "kind": "youtube#video",
    "videoId": "9Q7Vr3yQYWQ"
  },
  "snippet": {
    "title": "Led Zeppelin - Stairway to Heaven Live (HD)",
    ...
    "thumbnails": {
      "high": {
      "url": "https://i.ytimg.com/vi/9Q7Vr3yQYWQ/hqdefault.jpg"
      },
    },
    ...
  },
  ...
}
{% endhighlight %}

Therefore, we can map it to a `Video` type as follows.

{% highlight js%}
// This is the tagged constructor.
// e.g.
// const v = Video('1', 'http://...', 'http://...', 'Some Video');
// v.id; //=> '1'
// v.title; //=> 'Some Video'
// v instanceof Video; //=> true
const Video = daggy.tagged('id', 'thumbnail', 'url', 'title');

// toVideo :: VideoJSON -> Video
const toVideo = json => {
  const {
    id: { videoId },
    snippet: { thumbnails: { high: { url: thumbnail } }, title }
  } = json;
  return Video(videoId, thumbnail, `https://www.youtube.com/watch?v=${videoId}`, title);
};
{% endhighlight %}


<div class="alert alert-info note">
<strong>Note:</strong> I am using Haskell's type declaration notation in the comments above
the functions (e.g. <code>toVideo :: JSON -> Video</code>). It describes the input and output of the
declared function.
</div>

### Concept #2 - Code as data

The second concept is more commonly referred to as **higher-order functions**. It simply means that
functions can be used as input to other functions; and that functions can output new functions.

For example, given the `toVideo :: JSON -> Video` function above, we can use it to map over an array
of JSON objects.

{% highlight js %}
// Array of JSON objects
const jsonObjects = [{ "id": "1", ... }, { "id": "2", ... }, ...];

// Map over them to create array of Video.
const videos = jsonObjects.map(toVideo);

videos[0].id; //=> "1"
videos[1].id; //=> "2"
videos[2].id; //=> "3"
{% endhighlight %}

Here, the [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
method takes in a transformation function as input, and returns a new array with the original elements
transformed by the input function.

The downside of the `Array.prototype.map` method is that you can only call it in the context of the input data. As
an alternative, we can use Ramda's [`map`](http://ramdajs.com/0.19.0/docs/#map) function, which will
take in a transformation function as input (same as before), and then output a new function that can be called with
mappable objects (such as Array).

{% highlight js %}
const mapVideos = map(toVideo);

mapVideos(jsonObjects); //=> [Video("1"), Video("2"), Video("3")]
mapVideos([]); //=> []
mapVideos([{ "id": "4" }]); //=> [Video("4")]
{% endhighlight %}

This new `mapVideos` function is now completely modular and can be used with any array containing `VideoJSON` objects
to get an array of Video objects.

<div class="alert alert-info note">
<p>
  <strong>Note:</strong> The output function from <code>map</code> is called a <a href="http://clojure.org/transducers">transducer</a>.
  Transducers are composable transformations that are decoupled from input data. You can watch Rich Hickey's
  <a href="https://www.youtube.com/watch?v=6mTbuzafcII">talk on transducers</a> to learn more about them.
</p>
</div>

### Concept #3 - Composition all the way down

The third concept is that we can **compose** two functions (*f* and *g*) together (*g* ∘ *f*) as long
as *f*'s output matches *g*'s input.

![](/images/comp-2.svg)

In the illustration above, we created a new function *h* that composes *f* and *g*. This new function takes
a triangle as input (input of *f*) and outputs a circle (output of *g*). We can describe this in JavaScript
using the [`compose`](http://ramdajs.com/0.19.0/docs/#compose) function.

{% highlight js%}
const h = compose(g, f); // h(x) === g(f(x))
{% endhighlight %}

Taking this idea further, if we had another *red* function as follows -- taking in a nested data that includes triangle, then outputs
triangle.

![](/images/comp-4.svg)

Then, we can **compose** *red* and *h* together to take in the nested data, and output circle.

![](/images/comp-5.svg)

This allows us to start with simple functions and use composition to build up more powerful functions.
The advantage of this approach is that the functions are completely modular. All you have to do is make
sure that the inputs and outputs match while composing.

So, let's compose a few functions for our app!

#### Code - Mapping JSON response to videos

The `mapVideos` function that we previously implemented takes an array of `VideoJSON` objects as input, and
ouputs an array of Video objects (`mapVideos :: [VideoJSON] -> [Video]`). However, the YouTube API actually nests the array of video
JSON objects inside a structure like this:

{% highlight js %}
{
  ...
    "items": [
      { "id": ... },
      ...
    ]
}
{% endhighlight %}

We can retrieve the `VideoJSON` objects with the [`prop`](http://ramdajs.com/0.19.0/docs/#prop) function, which
returns a property (by name) when called with an object.

{% highlight js %}
prop('items')({ items: [{ id: 1 }] }); //=> [{ id: 1}]
prop('items')({ items: [] }); //=> []
{% endhighlight %}

Now, if we pass the response JSON to `prop('items')`, we will get an array of `VideoJSON` objects, which
is exactly what `mapVideos` takes as input. This is all we need to define the `toVideos` function.

{% highlight js %}
// toVideos :: VideoJSON -> [Video]
const toVideos = compose(mapVideos, prop('items'));

toVideos({ items: [{ id: 1 }, { id: 2 }]}); //=> [{ id: 1 }, { id: 2 }]
toVideos({ items: []}); //=> []
{% endhighlight %}


## Building a function to search videos

Let's recap what we have so far.

A function `makeUrl` that takes user input `String` and outputs an `Url`:

{% highlight js %}
// makeUrl :: String -> Url
const makeUrl = (term) =>
  `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&type=video&q=${term}&key='xxxx'`;
{% endhighlight %}

A function `toVideos` that takes `ResponseJSON` and outputs `[Video]`.

{% highlight js %}
// toVideos :: ResponseJSON -> [Video]
const toVideos = compose(mapVideos, prop('items'));
{% endhighlight %}

So we just need a function that can take in `Url` and output `ResponseJSON`. Well, it's not as simple as that
since we are dealing with an API call that goes over the network, thus we cannot return a simple value.
In this case, I am opting to use the [`Task`](https://github.com/folktale/data.task) type,
which represents a delayed computation. Think of it as a Promise, but does not have an effect right away.

Usage example:

{% highlight js %}
// Create new task that will resolve with 'hello' after 100 ms
const t = new Task((reject, resolve) => {
  setTimeout(() => resolve('hello!'), 100)
});

// The effect only happens when `fork` is called.
t.fork(
  // Rejected handler
  (x) => console.error(x),

  // Resolved handler
  (s) => console.log(s)
);
{% endhighlight %}

Now the function `httpGet` is defined as follows.

{% highlight js %}
// httpGet :: String -> Task Error ResponseJSON
const httpGet = (url) =>
  new Task((rej, res) =>
    fetch(url)
      // Since json() returns another promise,
      // we need to chain it down to the resolve function.
      .then((resp) =>
        resp.json().then(res)
      )
      .catch(rej)
  );
{% endhighlight %}

And then we can define the final `searchVideos` function as follows.

{% highlight js %}
// searchVideos :: String -> Task Error [Video]
export const searchVideos = compose(lift(toVideos), httpGet, makeUrl);
{% endhighlight %}

<p class="alert alert-info note">
<strong>Note:</strong> The <a href="http://ramdajs.com/0.19.0/docs/#lift"><code>lift</code></a>
function is used inside the composition. This is
needed since the return type of <code>httpGet</code> is <code>Task Error ResponseJSON</code>, we
need to lift the <code>ResponseJSON -> [Video]</code> transformation function into
a function that can operate on the future resolved value of the Task.
The type for <code>lift(toVideos)</code> is <code>M ResponseJSON -> M [Video]</code>, where
<code>M</code> is a mappable object -- in this case we are using a Task.
</p>

## Wiring up the UI

Now comes the easy part of putting the UI togther to use the `searchVideos` function
we just composed.

Here is the main `App` component:

{% highlight js %}
class App extends Component {
  constructor(props) {
    super(props);
    // Keep the results in app state
    this.state = { results: [] };
  }
  render() {
    return (
      <VideoSearch
        onSearch={(term) => {
          // Returns type `Task Error [Videos]`
          searchVideos(term).fork(
            // If there is an error, just log it.
            (e) => console.error(e),

            // Otherwise, update app state.
            (results) => this.setState({ results })
          )
        }}
        results={this.state.results}/>
    );
  }
}
{% endhighlight %}

And here is the less interesting `VideoSearch` component.

{% highlight js %}

const VideoSearch = ({ onSearch, results }) => (
  <div>
    <input placeholder="Search for videos"
           onChange={ ({ target: t }) => onSearch(t.value) }/>
    { videos.length === 0
        ? <div>No videos found</div>;
        : <div>
            { results.map(v => (
                <div key={v.id}>
                  <Embed video={v}/>
                </div>
            )) }
          </div>
    }
  </div>
);
{% endhighlight %}

The main thing to note is that the both the `App` and `VideoSearch` components are very simple.
All of the complexity is delegated to the `searchVideos` function, which as we've seen, is made up
of a bunch of smaller functions.

## Dealing with changing requirements

Let's consider a new requirement: We want to display a message to the user if *no search term is entered*.

To implement this, we will need a way to determine if the search has not been performed. We can use `Either`
to achieve this, and change the `searchVideos` function to return `Task Error (Either Empty [Video])`
instead of `Task Error [Video]`.

`Either a b` means the structure may contain a value of type `a` (Left) or type `b` (Right). The Left value represents an exceptional
value, which in our case we will use to represent an empty search state.

{% highlight js %}
// Left value means the search has not been performed, and the default message is contained in the object.
const Empty = Either.Left('Search for YouTube videos');

/* Usage example */

// This is a function that maps Videos inside an Either object to their titles.
// mapTitle :: Either l [Video] -> Either l [String]
const mapTitle = lift(map(prop('title')));

// Right value means we have performed the search and the results are available.
const s1 = Either.Right([
  Video('1', '...', '...', 'Led Zeppelin - Stairway to Heaven Live (HD)')
]);

mapTitle(s1); //=> Either.Right(Led Zeppelin - Stairway to Heaven Live (HD))
mapTitle(Empty); //=> Either.Left('Search for YouTube videos')
{% endhighlight %}

### Handling the case of not having an URL

Now, to determine whether a search can be performed in the first place, we can create a new
function `maybeMakeUrl :: String -> Maybe Url`. Note that we are returning a Url in the context
of a `Maybe`.

`Maybe` can be of type `Maybe.Just` or `Maybe.Nothing`, with the latter representing the case
of no value. (Note how we avoided using `null` or `undefined`)

{% highlight js %}
// maybeMakeUrl :: String -> Maybe Url
const maybeMakeUrl = (term) =>  (
  term && term.length > 0
    ? Maybe.Just(makeUrl(term))
    : Maybe.Nothing()
);

/* Usage example */
maybeMakeUrl(null); //=> Maybe.Nothing
maybeMakeUrl(''); //=> Maybe.Nothing
maybeMakeUrl('foo'); //=> Maybe.Just(https://www.googleapis.com/youtube/v3/search/?q=foo&...)
{% endhighlight %}

### HTTP GET using a Maybe URL

So now that we have a function that returns `Maybe Url`, we also need a new version of `httpGet`
that handles `Maybe Url` instead of just `Url`.

The Maybe type provides a `cata` method that will allow us to pattern match whether we have
`Just Url` or `Nothing` (think of it as using `x instanceof Maybe.Just` and `x instanceof Maybe.Nothing`).

{% highlight js %}
// maybeHttpGet :: e -> Maybe String -> Task Error (Either e JSON)
const maybeHttpGet = (e) => (url) =>
  url.cata({
    Just: compose(lift(Either.Right), httpGet),
    Nothing: () => Task.of(e)
  });
{% endhighlight %}

In the `Just` case, we are using the `lift` function to transform the `ResponseJSON` object inside the Task
to an `Either.Right` value.

In the `Nothing` case, we are returning a Task that contains the empty type `e` (`Empty` in our case). This
is similar to using `Promise.resolve(...)`, but for Tasks.

<div class="alert alert-info note">
<p>
<strong>Note:</strong> The <code>cata</code> method uses a concept called <a href="https://en.wikipedia.org/wiki/Catamorphism">Catamorphism</a>
(from Greek components "down" + "shape"). It provides a generalized way of collapsing a type based on its structure.
</p>
<p>
If you want to learn more about catamorphism, I found the <a href="http://fsharpforfunandprofit.com/posts/recursive-types-and-folds/#catamorphisms">
Introduction to recursive types</a> post of F# for fun and profit to be a good read.
</p>
</div>


### Refactoring the search videos function

Now that we have the two new functions `maybeMakeUrl` and `maybeHttpGet`, we can change `searchVideos` to the following.

{% highlight js %}
// searchVideos :: String -> Task Error (Either String [Video])
const searchVideos = compose(lift(lift(toVideos)), maybeHttpGet(Empty), makeUrl);
{% endhighlight %}

Notice that all other functions remain unchanged (`makeUrl`, `httpGet`, `toVideo`, `toVideos`).
We simply introduced two new functions, and refactored the final search function to handle Maybe and Either.

The `lift(lift(...))` call is made because we need to lift the `toVideos` transform function twice:

1. Once for lifting the transform to operate with `Either Empty ResponseJSON`.
2. Second time for lifting the lifted transform to operate with the future resolved value of type `ResponseJSON`.

### Refactoring the component to work with Either

And finally, we refactor the `SearchVideos` component to reduce the rendered element based on whether we have
a right value (search performed), or a left value (search not performed).

{% highlight js %}
results.cata({
  // This is the same as before, simply render the videos.
  Right: (videos) => {
    if (videos.length === 0) {
      return <div style={styles.fill}>No videos found</div>;
    } else {
      return (
        <div style={styles.results}>
          {
            videos.map(v => (
              <div key={v.id} style={styles.video}>
                <Embed video={v}/>
              </div>
            ))
          }
        </div>
      );
    }
  },
  // This is the new empty case, where we display the default message to the user.
  Left: (message) => <div>{ message }</div>
})
{% endhighlight %}

You can view the full source code by visiting the [repository on GitHub](https://github.com/jaysoo/example-fp-youtube-search).

The power of the functional approach is that what works in the small also works in the large. We started with
a simple function `makeUrl`, and eventually ended up with the more powerful function `searchVideos`. Along the entire
way we were using the same approach of thinking about input/output types, and function composition.

A nice benefit of having these pure functions is that we can easily use and test each of them separately. For example,
the `lift(lift(toVideos))` function can be called with input of type `Task Error (Either e ResponseJSON)`.

{% highlight js %}
const json = { items: [ {
               id: { videoId: '9Q7Vr3yQYWQ'},
               snippet: {
                 title: 'Led Zeppelin - Stairway to Heaven Live (HD)',
                 thumbnails: {
                    high: { url: 'https://i.ytimg.com/vi/9Q7Vr3yQYWQ/hqdefault.jpg' }
                 }
               } } ] };
const t1 = Task.of(Either.Right(json)); // input
const t2 = lift(lift(toVideos))(t1); // output

// Getting Video array out of the output task.
const either = t2.fork(identity, identity);
const videos = either.cata({ Right: identity });

videos[0].title; //=> 'Led Zeppelin - Stairway to Heaven Live (HD)'
{% endhighlight %}

## Summary

In this post, I presented the *little idea* behind functional programming in terms of three concepts.

1. **Data in, data out** - separating data and behaviour

2. **Code as data** - using functions as data

3. **Composition all the way down** - composing simple functions to form more powerful functions that are composable themselves

These three basic concepts will help you keep your application more modular by allowing you to
mix and match functions together (like a Lego!) as long as their types match up. This functional approach is something that works both
in the small and in the large.

If you are interested in learning more functional programming, I've included some videos below that were influential to me.


### Further Resources

- View the final [source code for the example on GitHub](https://github.com/jaysoo/example-fp-youtube-search).

- [Ramda](http://ramdajs.com/) - Functional utility library for JavaScript

- [Video] Check out [Classroom Coding with Prof. Frisby](https://www.youtube.com/watch?v=h_tkIpwbsxY&list=PLK_hdtAJ4KqX0JOs_KMAmUNTNMRYhWEaC&index=1)
for more functional programming with ReactJS.

- [Video] [Functional Programming for OO Development](https://www.youtube.com/watch?v=pMGY9ViIGNU) - Jessica Kerr

- [Video] [Destructuring Functional Programming](http://www.infoq.com/presentations/functional-pros-cons) - Gilad Bracha

- [Video] [Functional Programming from First Principles](https://www.youtube.com/watch?v=a-RAltgH8tw) - Erik Meijer

- [Video] [Functional Programming Design Patterns](https://www.youtube.com/watch?v=E8I19uA-wGY) - Scott Wlaschin

- [Video] [Railway oriented programming: Error handling in functional languages](https://vimeo.com/113707214) - Scott Wlaschin

