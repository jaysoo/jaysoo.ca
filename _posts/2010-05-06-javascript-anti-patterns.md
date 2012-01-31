--- 
created_at: 2010-05-06 21:26:00 -05:00
layout: post
typo_id: 36
title: JavaScript Anti-Patterns
tags: [javascript, anti-patterns]
---
<p>There are plenty of posts discussing anti-patterns in other languages, like <a href="http://www.google.ca/search?q=java+antipatterns">Java</a> or <a href="http://www.google.ca/search?q=python+antipatterns">Python</a>. However, I haven&rsquo;t really seen much regarding JavaScript besides this <a href="http://stackoverflow.com/questions/377999/what-anti-patterns-exist-for-javascript">question</a> on StackOverflow. And most of the ones I found don&rsquo;t separate the DOM API and the JavaScript language itself.</p> 
 
<p>So the following is a list of JavaScript anti-patterns that I&rsquo;ve compiled, with some explanations.</p> 
 
<h3>Polluting the global namespace</h3> 
 
<p>This is the biggest no-no, and is something all new JavaScript developers must learn. The reason you don&rsquo;t want to declare too many variables in the global namespace is the avoid conflicts with code written by others or yourself. Here&rsquo;s an example to illustrate this:</p> 
 
	function foo() { return 1; }
	function bar() { for (i=0; i<5; i++) {} }
	 
	i = foo();
	bar();
	 
	// what is i here?
 
<p>In this example, <code>i=5</code> at the end of execution. This happens because the variable <code>i</code> both inside and outside the function left out the <code>var</code> declaration, thus the engine declares it in the global namespace. And if everyone&rsquo;s code rely on global variables, you may break someone else&rsquo;s code accidentally.</p> 
 
<h3>Extending the Object prototype</h3> 
 
<p>Never, never, never extend Object.prototype. By doing that you could break a lot of code that do things such as <code>for (var a in myObj)</code> &ndash; such as jQuery. That is the very reason why Crockford&rsquo;s jslint promotes the use of <code>hasOwnProperty()</code> check. But IMO that produces ugly code. The better way is to just leave <code>Object.prototype</code> alone.</p> 
 
<h3>Using multiple var declarations instead of one</h3> 
 
<p>In each scope you can make multiple variable declarations by separating each one with a comma. This makes code more readable, and performs better too (albeit by a very small margin).</p> 
 
	// Don't do this
	function foo() {
		var x = 1;
		var y = 2;
		var z = 3;
	}
	 
	// Do this
	function foo() {
		var x = 1,
			y = 2,
			z = 3;
	}

<h3>Using&nbsp;<em>new Array()</em>&nbsp;and&nbsp;<em>new Object()</em></h3> 
<p>Please don&rsquo;t declare arrays and hashes like this.</p> 
	var arr = new Array(),
		hash = new Object();
	hash.a = 1;
	hash.b = 2;
 
<p>When you do this instead.</p> 
 
	var arr = [],
		hash = { a: 1, b: 2 };

<h3>Not making use of truthy/falsey values: undefined, null, false, &rdquo;, [], etc.</h3> 
<p>In JavaScript, a variable&rsquo;s value can be <em>truthy</em> or <em>falsey</em>. This mean that while the value isn&rsquo;t strictly equivalent to the boolean values true and false, they can be coerced into a boolean value.</p> 

	// No need for this!
	if (someString != undefined && someString != '') alert(someString);
	 
	// This gives the same result and is much cleaner
	if (!someString) alert(someString);
 
<p>You can run quick tests in your browser to check if something is truthy or falsey.</p> 
 
	var a; // undefined
	if (!a) alert('falsey');
	if (!'') alert('falsey');
	if ([1,2]) alert('truthy');
	if (!null) alert('falsey');
	if (!0) alert('falsey');
	if (100) alert('truthy'); 

<p> 
<meta charset="utf-8" /></p> 
<h3>Not making use of truthy/falsey values (part 2): for loops</h3> 
<p>Another great use of truthy and falsey is in a for loop. In most other languages, the exit-check of the loop usually makes sure the index does not go out of bounds. But in JavaScript we can do one better!</p> 

	// an array of lower-case letters
	var arr = ['a', 'b', ..., 'z'];
	 
	// don't do this
	for (var i=0; i<arr.length; i++) {
		// do something with arr[i]
	}
	 
	// do this
	for (var i=0, curr; curr=arr[i]; i++) {
	   // do something with curr
	} 

<p>The second for loop works because <code>arr[i]</code> is undefined if <code>i</code> is an out-of-bounds index, and <code>undefined</code> is falsey. Also, this method performs better (especially in IE 6/7 where <code>arr.length</code> lookup can be costly). <strong>Be careful</strong> not to use this approach if you know an array may contain a zero (0), or any other falsey values you don&rsquo;t want to prematurely exit from.</p> 
<h3>Using switch statements</h3> 
<p>A lot of times when you use a switch statement in JavaScript, you really should be using anonymous functions. This is because switch statements in JavaScript don&rsquo;t perform as well as you&rsquo;re probably used to in other languages.</p> 

	// you may want to do this
	function foo(x) {
		var a;
		switch (x) {
			case 0:
				a = 'foo';
				break;
			case 1:
				a = 'bar';
				break;
			case 2:
				a = 'faz';
		}
		return a;
	}
	 
	// but you should do this instead
	// Note: some anonymous function magic here... 
	//       but it's pretty much same as above!
	(function(scope) {
		var handlers = [
			function() { return 'foo'; },
			function() { return 'bar'; },
			function() { return 'faz'; }
		];
		scope.foo = function(x) {
			return handlers[x]();
		};
	})(this);
 
<p>This method can always be used when you want to switch on a string by using an hash instead of an array.</p> 
 
<p><strong>NB:</strong> there are times when a switch statement is appropriate, or even necessary. Control flow similar to<a href="http://en.wikipedia.org/wiki/Duff%27s_device"> Duff&rsquo;s device</a>, for example, needs the switch statement. Also, sometimes you don&rsquo;t need to worry about performance too much, and may think switch statements are clearer. I rarely use them though.</p> 
  
<h3>Not making use of truthy/falsey values (part 3): Converting a value using Boolean(x)</h3> 
 
<p>Okay, I&rsquo;m not sure if this counts a an anti-pattern but it&rsquo;s more of a personal preference. Of course we should <em>never</em> use <code>Boolean('')</code> inside an if-check, but sometimes we want to convert any value into an actual boolean. What you should do instead of using <code>Boolean(x)</code> is to use <code>!!x</code>. This works because !x returns true if x is falsey, and false otherwise. We then negate that boolean again to get what we want.&nbsp;</p> 
 
<h3>Using for-in loop over an array</h3> 
 
<p>Arrays in JavaScript are special objects, so a for-in loop doesn&rsquo;t do what you think it does.</p> 
 
	var arr = ['foo', bar', 'faz', baz']'
	for (var item in arr) {
	   // what is item here?
	}
 
<p>You may think you&rsquo;ll get the values of the array above, but you actually get the indices inside the array. It&rsquo;s easier just to stick to normal for loops.</p> 
