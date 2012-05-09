---
created_at: 2012-05-09 13:50Z
layout: post
title: Mixins in CoffeeScript and Backbone.js
tags: [javascript, mixins, coffeescript, backbone]
---

I'm a big fan of [CoffeeScript](http://coffeescript.org/). It makes working with Backbone.js so much nicer than doing it
in VanillaJS.


However, one thing I wish CS had was built in support for mixin declarations. There was some discussion on a closed pull request
for adding support for mixins, but no progress was made.

One of the snippets from the pull request gave me an idea for faking mixin support.

The following code will add an `include` function to the Backbone objects.


{% highlight coffeescript %}
include = (mixins...) ->
    throw('include(mixins...) requires at least one mixin') unless mixins and mixins.length > 0

    for mixin in mixins
      for own key, value of mixin
        @::[key] = value

      included = mixin.included
      included.apply(this) if included
    @

  Backbone.Model.include = Backbone.Collection.include = Backbone.View.include = Backbone.Router.include = include
                      
{% endhighlight %}

I use it with [RequireJS](http://requirejs.org/) and the facade pattern, so all my modules will load Backbone from the 
facade, thus everything is setup nicely. :)
