--- 
created_at: 2009-05-27 10:39:00 -05:00
layout: post
typo_id: 19
title: Playing around with Pylons
tags: [django, pylons, python, framework]
---
<p>I started playing with a Python web framework called <a href="http://www.sqlalchemy.org/">Pylons</a>. I've been using <a href="http://djangoproject.com">Django</a> for the last little while, but after hearing many positive feedback about the Pylons, so I decided it's time to get my hands dirty.</p>
<p>Although I've barely scratched the surface of Pylons, but here are some things I like about it.</p>
<ol>
    <li>I <em>love</em> <a href="http://pythonpaste.org/">Python Paste</a>. Deploying and dispatching your web app suddenly becomes very easy. You can even register your application at <a href="http://www.python.org/pypi">PyPi</a>.</li>
    <li>The default <a href="http://www.makotemplates.org/">Mako</a> templating engine is very, very fast. It has a newline filter (backslash) to consume the newline character before moving to the next line -- which is useful if you want nicely formatted HTML. Comments can be multi-lined -- something I wish was possible in Django. And it's also nice to have arbitrary Python code embedded in the page... should be used sparingly, but really useful sometimes.</li>
    <li><a href="http://www.sqlalchemy.org/">SQLAlchemy</a> is powerful. Arguably the best ORM in any language. Doesn't get in your way when designing your database and application architecture. You can map objects to any arbitrary joins or selects.</li>
    <li>Really gives you full control over your application. Pylons doesn't give you out-of-the-box admin or user authentication (like Django), but it does allow you to build your application exactly the way you want without having to work around the framework.</li>
</ol>
<p>Don't get me wrong. I like Django, and will continue to use it where it makes sense. Forms in Django 1.0 is really awesome, and I especially like ModelForm for creating forms from models. The admin view that comes with Django is great, and saves a lot of development time.</p>
<p>If you do use SQLAlchemy with Pylons, you can always check out <a href="http://docs.formalchemy.org/formalchemy.html">formalchemy</a>, which many of the same functionality as Django's ModelForm, but with SQLAlchemy mapped objects. As a bonus, you can even use a Pylons <a href="http://docs.formalchemy.org/ext/pylons.html">extension</a> with formalchemy that gives you automagically created admin interface for your objects.</p>
<p>And some more thoughts about Django.</p>
<ol>
    <li>You can use SQLAlchemy in Django. That is, if you're willing to give up the built-in admin and generic views, and ModelForms.</li>
    <li>There are ways to get other more powerful Python templating engines into Django (e.g. <a href="http://code.google.com/p/django-mako/">django-mako</a>), but it does require you do change your view code.</li>
</ol>
<p>&nbsp;So here are my not-so final thoughts.</p>
<p>I'll continue to use Django for the many&nbsp; web applications that are basically just <a href="http://en.wikipedia.org/wiki/Create,_read,_update_and_delete">CRUD</a> applications. For anything that you need to have fine-grained control over, Pylons seems to be the better choice. It also allows you do use</p>
