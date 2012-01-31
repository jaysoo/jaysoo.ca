--- 
created_at: 2009-04-01 11:09:00 -05:00
layout: post
typo_id: 15
title: Pythonistas Rejoice! Curly Braces Are In
tags: 
- python braces future
---
<p>Finally, we can do without the annoying "whitespace is signigicant" crap. You can import a new feature called <code>braces</code> from the <code>__future__</code> module. For those who don't know, the <code>__future__</code> module contains new features that are not yet included in the current Python version.</p>
<p>Now, instead of doing this:</p>
<pre class="brush: py">
def foo():
    # Ugh, I hate whitespace indents
    print 'Hello Braces!'
</pre>
<p>You can do this:</p>
<pre class="brush: py">
from __future__ import braces
def foo() { print 'Hello Braces!' } # Only one line!!!11!!11
</pre>
<p style="color: white;">April Fools!</p>

