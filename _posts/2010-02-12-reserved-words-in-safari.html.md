--- 
created_at: 2010-02-12 11:35:00 -06:00
layout: post
typo_id: 33
title: Reserved JavaScript Words in Safari
---
<p>I ran into a problem today where the RIA I'm building works for all browsers except Safari -- specifically Safari 4, not sure about 3.</p>
<p>The error happens when a certain page loads, and all I'm greeted with in Safar is `SyntaxError: Parser Error`. Nice.</p>
<p>After a little debugging and Googling, I realized that one of the objects I had setup used a property that was a <a href="https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Reserved_Words">JavaScript reserved word</a>. For whatever reason, SquirrelFish (Safari 4's JS engine) was the only engine to throw this error.</p>
<p>So something like this would work in all browsers except Safari:</p>
<pre class="brush: js">
// Parse Error in Safari 4
var myObject = {
    enum: 1,
    class: 'foobar',
    faz: 'baz'
};
</pre>
<p>Instead, you need to wrap reserved words around quotation marks.</p>
<pre class="brush: js">
// Works in Safari 4 now
var myObject = {
    'enum': 1,
    'class': 'foobar',
    faz: 'baz'
};
</pre>
<p>I'm not sure if SquirrelFish is correct, or the other engines. The inconsistency is a bit annoying though.</p>

