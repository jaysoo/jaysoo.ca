---
created_at: 2012-02-03 03:37Z
layout: post
title: Added Search to Website
tags: [search, javascript, elasticsearch, facet, search, nodejs]
---

I added searching capabilities to this static website. 
I don't think any website is useful these days without some basic search functionality.

I created a Jekyll plugin that will go through the posts and pages, and index them in [elasticsearch](http://elasticsearch.org/).
You can find the source code for the [indexer plugin](https://github.com/jaysoo/jaysoo.ca/blob/master/_plugins/indexer.rb)
 on my GitHub account. Right now it indexes all of the documents (posts and pages) each time the website is generated -- the whole 
process is about 7 seconds each. 

I will eventually have to check the last modified date on the document files, and only
index the ones that are either **1)** new or **2)** have been modified since last indexed.

BTW, my elasticsearch index settings (including mapping) can be viewed [here](https://github.com/jaysoo/jaysoo.ca/blob/master/_data/jaysoo.json) 
-- this is for the **jaysoo** index, with only one type (**page**).

I implemented a simple search service using [node.js](http://nodejs.org), which will perform faceted queries 
against elasticsearch. The results are returned in JSON format (unchanged from elasticsearc's response).
You can view my node.js server code by view the [Gist](https://gist.github.com/1727561)

On the front-end, I am using [visualsearch.js](http://documentcloud.github.com/visualsearch/), which is
an excellent library from [DocumentCloud](http://www.documentcloud.org/) (same company 
that made [Backbone.js](http://documentcloud.github.com/backbone/) and 
[Underscore.js](http://documentcloud.github.com/underscore/)). It provide the ability to do faceted 
searches from a sinle search box.

The result is a JavaScript driven (both front-end and backend) [search page](http://jaysoo.ca/search.html).
Unfortunately, the search page will not work unless you have JavaScript enabled. I think that's okay, 
at least for the time being.

