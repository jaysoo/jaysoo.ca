--- 
created_at: 2009-09-18 08:42Z
layout: post
typo_id: 29
title: Java control flow exercises
tags: [java, controlflow]
---
<p>I came upon an interesting <a href="http://www.eiffelroom.org/blog/manus_eiffel/and_people_are_still_using_java">blog post about Java control flow</a>. The author listed six examples (from <a href="http://se.inf.ethz.ch/laser/2009/">LASER 2009</a> summer school on Software Testing) of pseudo Java code, and you have to determine what the value of the <code>int b</code> is, as well as whether an <code>Exception</code> is thrown or not. You can assume the program will execute with proper syntax, and proper <code>throws Exception</code> on the method signature.</p>
<p>&nbsp;Here are my answers, and explanations. The actual answers will be posted in the author's next blog entry.</p>
<p>1. What is the value of b at the end of this code:</p>

{% highlight java %}
foo () {
	int b = 1;
	b++;
}
{% endhighlight %}

<p><em>My answer:</em> <code>b</code> is 2</p>
<p>2. What is the value of b at the end of this code:</p>

{% highlight java %}
foo () {
	int b = 1;
	while (true) {
		b++;
		break;
	}
}
{% endhighlight %}

<p><em>My answer: </em><code>b</code> is 2 because it gets incremented one first iteration of the <code>while</code> loop, then the loop breaks.</p>
<p>3. What is the value of b at the end of this code and tell us if this executes normally or with an exception:</p>

{% highlight java %}
foo () {
	int b = 1;
	try {
		throw new Exception();
	}
	finally {
		b++;
	}
}
{% endhighlight %}

<p><em>My answer:</em> The exception is thrown, and then <code>b</code> is incremented to 2. And since the exception in not caught, it is thrown from the method.</p>
<p>4. What is the value of b at the end of this code and tell us if this executes normally or with an exception:</p>

{% highlight java %}
foo () {
	int b = 1;
	while (true) {
		try {
			b++;
			throw new Exception();
		}
		finally {
			b++;
			break;
		}
	}
	b++;
}
{% endhighlight %}

<p><em>My answer:</em> <code>b</code> is incremented in the <code>try</code> block, then exception is thrown. In the <code>finally</code> block, <code>b</code> is incremented again, then a static return from <code>break</code> brings control flow to the end of the method where <code>b</code> is once again incremented, and no exception is thrown from the method. So, <strong><code>b</code> is 4</strong> at the end, and <strong>no exception is thrown</strong>... in fact, you don't even need a <code>throws Exception</code> in the method signature because this method cannot throw <code>Exception</code>.</p>
<p>5. The previous sample was too long, what does this return:</p>

{% highlight java %}
int foo () {
	try {
		return 1;
	}
	finally {
		return 2;
	}
}
{% endhighlight %}

<p><em>My answer:</em> the <code>return 2</code> is the last statement executed in the method, so it returns 2.</p>
<p>6. If you have answered properly to the above questions, then you are definitely quite an expert. To prove it, tell us the value of b at the end of the call as well as the return value:</p>

{% highlight java %}
int b;
int foo () {
	b = 0;
	try {
		b++;
		return b;
	}
	finally {
		b++;
	}
}
{% endhighlight %}

<p><em>My answer:</em> <code>b</code> is incremented in the <code>try</code> block, then returned; <strong>return value is 1</strong> from the method. Then the <code>finally</code> block executes and increments <strong><code>b</code>, so it is 2</strong> at the end (but return value is still 1).</p>

<div class="hero-unit well">
<h4>Update: Feb 2, 2012</h4>
<p>Looks like I was write on all the parts. :)</p>
<a href="http://www.eiffelroom.org/blog/manus_eiffel/and_people_are_still_using_java_answers" rel="external">Read the answers post</a>
</div>

