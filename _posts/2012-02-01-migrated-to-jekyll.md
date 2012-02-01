---
created_at: 2011-02-01 00:49:00 -05:00
layout: post
title: Migrated to Jekyll
tags: [jekyll, blog]
---

I decided to use [Jekyll](https://github.com/mojombo/jekyll) for my personal website/blog.
Jekyll is a static site generator written in Ruby. I've migrated all my posts from Typo into
Markdown post files, and everything is inside a Git repo. I think this setup makes a lot of 
sense (for me) for a few reasons:

- Serving the website is much easier and faster (nginx + static files)
- Less security problems than serving a dynamic website
- Having version control in Git is just awesome!
- I prefer writing my posts in Markdown, using Vim, as opposed to using a WYSIWYG editor online

There are a few downsides to a static website though:

- No commenting support
- No searching

The comment problem is easily avoided by using a service like [Disqus](http://disqus.com/), 
and the searching isn't a deal-breaker. I can add in a search box to goes to Google Search 
at some point.


Anyway, I'm hoping this setup will motivate me to blog more.

