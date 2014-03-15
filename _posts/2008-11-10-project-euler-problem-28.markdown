---
created_at: 2008-11-10 20:03Z
layout: post
title: Thinking Analytically - Project Euler Problem 28
tags: [projecteuler, python]
---

In this post, I will show a method for analyzing Problem 28 on [Project Euler](http://projecteuler.net/)
that goes beyond brute-forcing (even though that is an option).

If you're not familiar with Project Euler, here is a description from its website:

<blockquote>
Project Euler is a series of challenging mathematical/computer programming problems
that will require more than just mathematical insights to solve. Although mathematics
will help you arrive at elegant and efficient methods, the use of a computer and
programming skills will be required to solve most problems.
</blockquote>

After my answer was submitted I read through some of the solutions that have been posted.
It seems that most of them are using brute-force to attack this problem, so I will
show how I devised a more efficient method to solving it.

## The Problem

    Starting with the number 1 and moving to the right in a clockwise direction a 5 by 5 spiral is formed as follows:

    21 22 23 24 25
    20  7  8  9 10
    19  6  1  2 11
    18  5  4  3 12
    17 16 15 14 13
    It can be verified that the sum of both diagonals is 101.

    What is the sum of both diagonals in a 1001 by 1001 spiral formed in the same way?

## Solution

The first thing to notice is that you don't have to actually construct the spiral in order to solve this problem.
In an `nxn` spiral, the values of the four corners are as follows:

top-right: `n^2`
top-left: `n^2 - n + 1`
bottom-left: `n^2 - 2n + 2`
bottom-right: `n^2 - 3n + 3`

Adding all that up yields `4n^2 -6n + 6`.

At this point you can loop through from 3 to 1001 (in increments of 2) and add up the results.
Just make sure you add a 1 to the results for the base case. :)

## Further Generalization

Of course, we can take this generalization even further.
The result for an `nxn` spiral can be expressed by a formula.

    Sum(i = 1:500)[4(2*i + 1)^2 - 6(2i + 1) +6]

The beginning reads "sum from i=1 to 500"... I'm not too sure how to type out sigma notations properly.

Converting the summation into closed form gives the formula we're looking for.

    (16n^3)/3 + (10n^2)/2 + 26n/3

And here is the complete solution in Python.

{% highlight python %}
from math import pow
def prob28(n): return (16*pow(n, 3) + 26*n)/3 + 10*pow(n, 2)
print prob28(500) + 1
{% endhighlight %}
