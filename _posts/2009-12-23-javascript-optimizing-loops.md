--- 
created_at: 2009-12-23 14:35:00 -06:00
layout: post
typo_id: 31
title: "JavaScript: Optimizing loops"
---
<p>When looping through very large arrays, you may find this tip useful: it's much fast to use a while loop to iterate through an array than a for loop.</p>
<p>For example, if you take this code:</p>

	var myArray = new Array(10000);
	for (var i=0; i<myArray.length; i++) {
		myArray[i] = i;
	}

<p>You can make it run faster by using a while loop instead.</p>

	var myArray = new Array(10000);
	var n = myArray.length;
	while (n--) {
		myArray[n] = n;
	}

<p>This works because <code>n--</code> will return the value of <code>n</code> and then decrement it. So when it approaches index zero, it'll coerce <code>1</code> to <code>true</code>, then decrement <code>n</code> before the line <code>myArray[n] = n;</code>.</p>
<p>Of course, this while-loop is looping backwards, so if the order of iteration does matter then you can't use this method. You could however, still optimize the first example by first assigning <code>myArray.length</code> to a variable, then using that in the for-loop's exit condition. This will make it run slightly faster (depending on which browser you're using) because it avoids a property lookup at every loop iteration.</p>

	var myArray = new Array(10000);
	var n = myArray.length;
	for (var i=0; i<n; i++) {
		myArray[i] = i;
	}

