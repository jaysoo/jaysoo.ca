--- 
created_at: 2010-03-24 09:48:00 -05:00
layout: post
typo_id: 34
title: JavaScript Namespacing
tags: 
- javascript modules organization jquery namespace
---
<p>One of the first things you learn programming in JavaScript is, "<a href="http://yuiblog.com/blog/2006/06/01/global-domination/">Global variables are evil</a>." This is especially true when writing a JavaScript library, but I'd take that advise even otherwise to avoid unnecessary headaches.</p>
<p>As an avid jQuery user, one thing I do in almost every project is define a namespace function on the <code>jQuery</code> object.</p>
<pre class="brush: js">
jQuery.namespace = function(ns, obj) {
    var ns = ns.split('.'), 
        p = window,
        i;
    for(i=0; i<ns.length; i++) 
        p = p[ns[i]] = p[ns[i]] || {};
    if (obj) 
        jQuery.extend(p, jQuery.isFunction(obj) ? obj(p) : obj);
};
</pre>
<div>&nbsp;</div>
<p>This function will take in either an object or a function that takes in an object, then create the namespace or extend it if it exists.</p>
<pre class="brush: js">
// Example 1
$.namespace('foo.bar', {
    myVar: 1, myOtherVar: 2, someFunction: function() { alert(this.myVar + ',' + this.myOtherVar); }
});
foo.bar.someFunction();
//--> alerts "1,2"

// Example 2
$.namespace('faz', { baz: { a: 1, b: 2 } });
$.namespace('faz.baz', function(old /* previous namespace */) {
    old.a = 'new value'; // change previous assignment of a
    old.printMe = function() { alert(old.a + ',' + old.b); };
});
faz.baz.printMe();
//--> alerts "new value,2"
</pre>
<p>The second example shows a case where an function is passed instead of an object. This is useful for many reasons which I won't get into... actually you can read a great post here about <a href="http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth">JavaScript module patterns</a>.</p>
<p>And when jQuery isn't being used on a project, the following does the exact same.</p>
<pre class="brush: js">
function namespace(ns, obj) {
    var ns = ns.split('.'), 
        p = window,
        i, k;
    for(i=0; i<ns.length; i++) 
        p = p[ns[i]] = p[ns[i]] || {};
    if (obj) {
        obj = obj instanceof Function ? obj(p) : obj;
        for (k in obj) {
            if (obj.hasOwnProperty(k))
                p[k] = obj[k];
        }
    }
}
</pre>
<div>&nbsp;</div>

