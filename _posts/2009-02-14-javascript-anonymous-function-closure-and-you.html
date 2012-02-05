--- 
created_at: 2009-02-14 19:35Z
layout: post
typo_id: 5
title: JavaScript, Anonymous Function, Closure, and You
tags: [javascript, closure, anonymousfunction, partialapplication]
---
<p>There are many things that web developers <em>should</em> know about JavaScript, but the most basic of things are <a href="http://en.wikipedia.org/wiki/Anonymous_function">anonymous functions</a> and <a href="http://en.wikipedia.org/wiki/Closure_(computer_science)">closure</a>. Both are very powerful tools for anyone working with JavaScript.</p>
<p>So what's so great about them you ask? Well, I think that's best explained using some examples.</p>
<p>Let's say we want to implement a function that will take an integer representing a month, and return it's name as a string.<br />
e.g. 1 -> 'January', 2 -->&nbsp; 'February', 9 --> 'September'</p>
<p>We'll start out with a naive implementation, but perhaps one that first comes to mind.</p>

	function monthName(i) {
		var months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		return months[i-1];
	}

<p>Simple right? But there's something wrong with this function. Take a look at the array declaration, it's inside the function! That means everytime you call the <em>monthsName</em> function, it'll create an array. This not only slows down your function, but it uses an unnecessary amount of memory.</p>
<p>Our first improvement then, would be to move the array to the outside of the function.</p>

	var months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	function monthName(i) {
		return months[i-1];
	}

<p>Great, now we only create array once! But wait, there's another problem. We've just moved the <em>months</em> array into the global namespace. This is bad because we might be overwriting a previously declared variable also named <em>months</em>. Similarly, someone later on might overwrite our <em>months</em> array. D'oh!</p>
<p>Fortunately, there is a way around this. And this is where anonymous functions and closure come in. Let me show you the solution first.</p>

	var monthName = function() {
		var months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		return function(i) {
			return months[i-1];
		};
	}();

<p>So how does this work?</p>
<p>First, you'll notice the block of code inside the outter function is similar to our second solution, except that the function name has been dropped, and it is now the return value of the outter function. The outter function is executed immediately,&nbsp; and is assigned to the variable <em>monthName</em>. Thus <em>monthsName</em> is really the inner function. Sort of.</p>
<p>Here is where closure comes in. The inner function refers to the <em>months</em> array declared outside of it, but because of closure, that array is bound to the function. So when we call the function <em>monthName</em> we are really calling the returned result of an anonymous function (which itself is an anonymous function). And this returned function has the <em>months</em> array bound to it.</p>
<p>Here's another example using anonymous functions and closure to implement <a href="http://www.haskell.org/haskellwiki/Partial_application">Partial Application</a> in Javascript.</p>

	Function.prototype.papply= function() {
		var fixed = Array.prototype.slice.call(arguments),
			fn = this;
		return function() {
			return fn.apply(this, fixed.concat(Array.prototype.slice.call(arguments)));
		};
	}	

<p>Of course, you can probably achieve everything I've shown here without anonymous functions or closure, but why make it hard for yourself? Learn these tools, use them to your advantage!</p>
