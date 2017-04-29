---
created_at: 2017-01-24 20:39Z
layout: post
title: Don't Fear the Type System
tags: [programming,kotlin,types,java,ruby]
---

There's been a lot of talk about static types recently. I've especially noticed that folks who
usually work with dynamically typed languages have become big
proponents of static typing -- and I count myself amongst them.

Being a fan of Robert C. Martin (aka Uncle Bob) for a long time, it was a surprise for me to
see that he has written not [one](http://blog.cleancoder.com/uncle-bob/2017/01/11/TheDarkPath.html),
but [two](http://blog.cleancoder.com/uncle-bob/2017/01/13/TypesAndTests.html) blog posts on
the subject of *The Dark Path*. He refers to the trend of languages becoming more "strongly" typed
as this dark path. Something I disagree with.

Now, I'm not against people holding differing opinions, and it is important that we remain open
to opposing views. What I disagree with is the spread of fear through misinformation.

> Fear is the path to the dark side.
>
> Fear leads to anger.
>
> Anger leads to hate.
>
> Hate leads to suffering.
>
> -- Yoda

In this post, I want to address some of the concerns made against "strong" static types. And I
want to present a few reasons for why you may want to consider languages with more powerful
type systems, such as Kotlin, for your own projects.

## The power of a type system

Firstly, I don't really like using the term *strong* typing. It's [ambiguous](https://gist.github.com/garybernhardt/122909856b570c5c457a6cd674795a9c#strong-and-weak-typing),
and not that useful when discussing type systems. For the purpose of discussion, I describe
the power of a type system as the level of expressivity it affords the programmer.

In a dynamic language like Ruby, you cannot encode any type information in code, thus it is
not very powerful. Take this simple example of an `add` function in Ruby.

{% highlight ruby %}
def add(a, b)
  a + b
end
{% endhighlight %}

The only guarantee that we can get with this `add` function is that it will run. The only
static check that can be performed is that the program has *valid syntax*.

This means that `add(1, '2')` is a valid program, but if you run it then `TypeError`
will be thrown.

Now, if we look at the same function in Java, we end up with something like this.

{% highlight java %}
BiFunction<Integer,Integer,Integer> add = (a, b) -> a + b;
{% endhighlight %}

If we invoke the function with `add.apply(1, "2")`, then the program is invalid and will not compile
because `"2"` is not an `Integer` -- even though it is syntactically valid!

The difference between the Ruby and Java functions is that in the latter function, we were able
to encode *constraints* about the valid types that it accepts. This is what we refer to as a
*static type system*.

The main advantage of having a static type system is that we get more guarantees about our program
without having to run it. By *constraining* `add` to only integer parameters, we rule out a whole class
of programs that erroneously call it with unsupported types.

There is, however, still a way to compile a valid program that will result in a runtime exception.

{% highlight java %}
// Passing null reference is still a valid Integer!
add.apply(1, null);
{% endhighlight %}

Running this program will result in a null pointer exception (NPE).

To deal with nulls, most programmers employ a number of patterns and tests, such as guard-clauses
and using preconditions to reject invalid parameters early. You can see examples of these patterns in the
book [Confident Ruby](https://www.confidentruby.com/) -- FYI, it is a great book if you work with Ruby.

But, can we do better?

### Null References: The Billion Dollar Mistake

The inventor of null reference, Tony Hoare, has famously referred to it as the ["Billion Dollar Mistake."](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare)

The reason that null is so dangerous is that it subverts all static type checking in many programming languages.
The onus is on the programmer to be very careful at all times, because there is no guarantee that they will
not receive a null reference at any point in the program.

For this reason, many newer programming languages include the concept of *nullable types*.

Let's see how the add function can be implemented in Kotlin (another language that runs on the JVM).

{% highlight java %}
var add = { a: Int, b: Int -> a + b }
{% endhighlight %}

If we try to call the function with `add(1, null)` then we will get a static type error, since we did not declare `b`
as a nullable type `Int?`. In case we want to allow nullable types, we need to *explicitly* declare them, which will force us to handle
null references whenever we use those values.

{% highlight java %}
// This is not valid because we did not handle the null case of b.
var add = { a: Int, b: Int? -> a + b }

// This is valid since we handled nullable b.
var add = { a: Int, b: Int? -> if (b != null) a + b else null }
{% endhighlight %}

And since Kotlin infers the return type correctly as `Int?`, you cannot use it without checking for null again.

{% highlight java %}
var add = { a: Int, b: Int? -> if (b != null) a + b else null }

// Won't compile because return type from add(1, null) is nullable.
add(1, null) + 2
{% endhighlight %}

And just as going from Ruby to Java provides more guarantees about the correctness of our programs, so too does going
from Java to Kotlin provide even more guarantees of correctness. By introducing nullable types, Kotlin eliminates
a whole class of runtime errors.

<div class="alert alert-warn">
<strong>Note:</strong> There is an issue of potential null errors coming from the Java side, even though they are all checked on the Kotlin side.
This is because Kotlin does not assume all values coming from the Java side to be nullable, so you will still need to guard against
this yourself.
</div>

## Whose job is it to prevent defects?

The main thesis in the Dark Path blog post is that the responsibility is on the programmer to prevent defects,
and that we shouldn't keep adding language features just to prevent defects.

> Defects are the fault of programmers. It is programmers who create defects - not languages.

He goes on to claim that languages are adding features such as nullable types, because programmers are not testing their code.

> Why are these languages adopting all these features? Because programmers *are not testing* their code. 

I completely agree that programmers are responsible for preventing defects, and that testing *is* important. I, however, also
think that the static type checking is a great tool for eliminating whole classes of errors that we don't have to write
tests for.

If we can specify function parameters are integers, then the static type checker can let us know when we mistakenly call it with strings.
And in the same vein, if we can specify function parameters as integers, then the type checker can let us know
when we mistakenly call it with nulls.

In fact, with more powerful type systems, there are a whole class of tests that you don't have to write!. Example-based testing
only guarantees that the code is correct for the *given examples*, but types make guarantees about *all programs* in the language.
(There are also other types of testing, such as propery-based testing, but that is out of scope for this post.)

Of course, you can override the null safeties in Kotlin using the `!!` operator (e.g. `add(1, null)!! + 1`), and then you're back to runtime NPEs.
But so too can you simply skip or delete failing tests because you are too lazy to fix the program properly. The discussion should
not be types versus tests, but **types *and* tests**.

The main benefit of types and tests are that they both *constrain* what a valid program can be. Tests can provide guarantees about
runtime constraints and behaviour, and types provide guarantees about compile-time constraints.

<div class="alert alert-info">
<strong>Note:</strong> I left out behaviour guarantees in a type system since in most languages, this is not possible. However, there are languages
with dependent types, such as <a href="http://docs.idris-lang.org/en/latest/tutorial/theorems.html">Idris</a>, that can achieve this with theorem proving.
</div>

## Constraints liberate. Liberties constrain.

Often times we as programmers want the freedom to do whatever we want. Constraints simply get in our way when we are trying to do our job!

I think this mentality is misguided. If we program without constraints, then our brain is forced keep track of all possibilities
in our program. Can I trust an `add(a, b)` function in Ruby to do the correct thing? Will it blow up if I call it with `nil` or `str`? What am
I getting in return? An `int`? Can it be `nil`?

What if I pass the result of `add` into another function? Now I have just compounded the problem even further!

Without contraints, our programs are *impossible to reason about* and the task of understanding it can be a huge mental drain. But *with* constraints, we can
liberate our mind to focus on higher level abstractions.

### Contraints a la carte

When we want to add constraints in the system, we can either do it via static types or by adding tests.

In dynamic languages such as Ruby, we only have tests to work with, so we typically turn to TDD. This helps us immensely because we are forced
to think about valid types and behaviour before writing code.

In Java, we can have some language-level constraints via static types, but we can also add more constraints via tests. In our tests, we no longer
need to consider testing `add` with non-integers since the program will not compile anyway. Furthermore, we also do not need to test that the return
type *must* be integer, since that is guaranteed statically as well -- except for the `null` case. This removes some burden on the programmer to write
certain classes of type tests.

Finally, in Kotlin, we can express that the `add` function *cannot* receive null references, thus there is little value in testing for those cases.
And of course, we should still be testing for behaviour that cannot be encoded in the type system.

When it comes to preventing defects, both tests and static types can help greatly, so we should be taking advantage of both!

## Expressivity of a type system

So far, we've seen how constraints are helpful when writing software. The more powerful the type system is, the more constraints we can encode into
our programs.

We can also say that a powerful type system, such as the one found in Kotlin, provides an increase in *expressivity*. For example, if I designed my function
to handle null inputs, then I can express that information statically using nullable types.

The expressivity of Kotlin goes beyond nullable types though. There are many other constraints that you can encode into your program.

We will examine one more featured of Kotlin, **the sealed class**, and how it can help write better software.

### Sealed classes

Sealed classes can be used to represent restricted class hierarchies. When a class is marked as sealed, it can only be extended by its nested classes.

Here's an example of a `Either<A,B>` type, which can have either a left value of type `A` and a right value of type `B`. It is biased towards
the right, meaning that mapping over its value will only map the right side. The left side can be considered as an error or exceptional value.

{% highlight java %}
sealed class Either<A,B>() {
    class Left<A,B>(val value: A): Either<A,B>()
    class Right<A,B>(val value: B) : Either<A,B>()

    override fun toString(): String = when(this) {
        is Left -> "Left: ${this.value}"
        is Right -> "Right: ${this.value}"
    }
}
{% endhighlight %}

The sealed class hierarchy allows us to express a [*tagged union*](https://en.wikipedia.org/wiki/Tagged_union). That is, we can write a type, which can take
on any value within the sealed set of subclasses. In this case, we can use do the following.

{% highlight java %}
var x: Either<Int,String> = Either.Left(404)
println(x) // Prints: "Left: 404"

x = Either.Right("Success!")
println(x) // prints "Right: Success!"
{% endhighlight %}

The advantage of using a sealed class is that the *when* expressions can be statically checked to be exhaustive. If we miss a case in a `when` expression,
the compiler will inform us that it is not total. To gain this exhaustive guarantee, we need the constraint that the base class will not be extended
further by addtional subclasses.

Again, the *constraint* of disallowing extension gives us *more expressiveness*. In this case, we can now define a tagged union using sealed class hierarchies.

#### Exhaustive pattern matching

Let's look at how we can take advantage of the exhaustive pattern matching by implementing two functions:

1. The `of` function which will return a boxed right value.
2. The `flatMap` function which will apply a transform function to the boxed right value -- ignoring left value.

Here is the `of` function, which returns a boxed right value.

{% highlight java %}
sealed class Either<A,B>() {
    // ...

    companion object {
        fun <A,B>of(b: B): Either<A,B> {
            return Either.Right<A,B>(b)
        }
    }
}
{% endhighlight %}

The companion object can be thought of as an object containing static methods on the base class. We can now use the new function as follows.

{% highlight java %}
// Left Int value could be an error code
val x: Either<Int,String> = Either.of("Hello")
{% endhighlight %}

And, here is the `flatMap` function to transform the right boxed value.

{% highlight java %}
sealed class Either<A,B>() {
    // ...

    // There is actually an error in this implemention!
    fun <C>flatMap(transform: (x: B) -> C): Either<A,C> = when(this) {
        is Right -> Right(transform(this.value))
    }
}
{% endhighlight %}

We are pattern matching against the type of `Either`, and when we see `Right`, we return its value. Pretty straight-forward right?

But not so fast! There is an **error** here. The compiler will complain that the `when` expression is missing the `Left` branch.
To fix this, we need to add a check for `Left` as well, to make the pattern match exhaustive.

{% highlight java %}
sealed class Either<A,B>() {
    // ...

    fun <C>flatMap(transform: (x: B) -> C): Either<A,C> = when(this) {
        is Left -> Left(this.value)
        is Right -> Right(transform(this.value))
    }
}
{% endhighlight %}

And we can now use the `flatMap` function as follows.

{% highlight java %}
val exclaim = { s: String -> "$s!" }
val upper = { s: String -> s.toUpperCase() }

val x: Either<Int,String> = Either.of("Hello")

println(x
        .flatMap(exclaim)
        .flatMap(upper)) // Prints "Right: HELLO!"

x = Either.Left(404)

println(x
        .flatMap(exclaim)
        .flatMap(upper)) // Prints "Left: 404" because flatMap ignores left value
{% endhighlight %}

(As you may have noticed, the `Either` type is a monad.)

Now, we could have achieved similar results in Java using a `final` class, but it would be impossible to guarantee the exhaustiveness of pattern
matching, which is achieved using `when` expressions in Kotlin. This is where tests comes in of course, but tests can only provide guarantees
for the given set of examples, whereas types can provide language-level guarantees.

If we specify *another subclass* in a sealed class, then there is no way we would have tested for that in our test suite. This is where
the type system can help us out tremendously.

Moreover, without nullable types, even a simple expression such as `Either.Right(...).flatMap(upper)` can explode on us, because we forgot
to check for null reference on the input to upper (since `null` is a valid `String`).

## Closing

There has been some discussion on the value of more and more powerful type systems -- such as in Kotlin. The concerns regarding additional
language-level constraints are valid, but I truly believe that adding more language-level constraints will provide us with more freedom
in the long run.

Just as testing allows us to constrain the types and behaviour of our programs, so too can static type checking provide even stronger guarantees.
Testing shows that the program behaves correctly given a set of examples, whereas static types provide guarantees for all programs.

If programmers are given the ability to encode their design into their code, it will create less ambiguous programs. The decrease
in ambiguity helps us reason about our code much better, therefore making less mistakes.

I hope you enjoyed this post. And if you haven't already, I hope you will consider coming down *The Dark Path* with me and try out one of these languages!

## Suggested Resources

- [Kotlin Language Reference](https://kotlinlang.org/docs/reference/)

- [Gary Bernhardt's write-up of types](https://gist.github.com/garybernhardt/122909856b570c5c457a6cd674795a9c#strong-and-weak-typing) provide good insights
  into static vs dynamic, and strong vs weak.

- [Null References: The Billion Dollar Mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare) (video)

- [Constraints Liberate, Liberties Constrain](https://www.youtube.com/watch?v=GqmsQeSzMdw) (video)


