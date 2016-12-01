---
created_at: 2015-03-13 00:23Z
layout: post
title: Avoiding Composability Issues With Angular 1 Directives
redirect_from:
  - /2015/03/13/different-approach-to-angular-directives
tags: [javascript, angular]
---

In Angular 1, directives are a way for developers to extend HTML. This means
introducing new behaviours to the DOM via custom tags or attributes. You can
change what a directive matches by using the `restrict` option. By default it
is set to `'EA'`, meaning it works on elements (tags) and attributes.

These days, I'm **restricting directives to only elements** (`restrict: 'E'`).
The reason is that attributes are hard to compose. When multiple attribute
directives exist on one element, it can be challenging to figure out the resulting
behaviour.


<div class="alert alert-warning">
  <strong>Warning:</strong> This post was written for AngularJS 1.4 and may contain outdated information.
  Please see <a href="http://www.codelord.net/2016/11/23/spotting-outdated-angular-1-dot-x-posts/">This post</a>
  for things to watch out for when reading older Angular posts.
</div>

## Composability issues with attributes

Say I have these two directives that changes text colour depending on a value it observes.

{% highlight js %}
m.directive('greenIf', () => ({
  restrict: 'A',
  link(scope, element, attrs) {
    scope.$watch(attrs.greenIf, (value) => {
      if (value) {
        element.css('color', 'green');
      }
    });
  }
}));

m.directive('redIf', () => ({
  restrict: 'A',
  link(scope, element, attrs) {
    scope.$watch(attrs.redIf, (value) => {
      if (value) {
        element.css('color', 'red');
      }
    });
  }
}));
{% endhighlight %}

Now if I add them to the same element like so, what result do I expect?

{% highlight html %}
<div red-if="true" green-if="true">
  What colour am I?
</div>
{% endhighlight %}

The answer is actually *green* because it comes after red when sorting alphabetically, so its link function is invoked last.
In this case, both directives have the default priority of `0`, so according to the
official docs, their ordering is undefined. However, looking at the [source code](https://github.com/angular/angular.js/blob/41fdb3d5367a7e439822ebd7fc4a473b3a89feaa/src/ng/compile.js#L2266)
shows us that they are indeed sorted alphabetically. Just don't count on this
ordering in the future.

Now, I could guarantee their ordering by setting specific priority values. I
don't like this approach, because directives with a priority value forces
developers to have to map out all of the directives' interactions in their head
in order to reason about them. As the number of directives grow, it becomes impossible
to load everything into your head!

## Composing elements instead of attributes

If I were to re-write the directives on elements instead, the result is much
easier to understand.

{% highlight js %}
m.directive('greenIf', () => ({
  restrict: 'E',
  link(scope, element, attrs) {
    scope.$watch(attrs.value, (value) => {
      if (value) {
        element.css('color', 'green');
      }
    });
  }
}));

m.directive('redIf', () => ({
  restrict: 'E',
  link(scope, element, attrs) {
    scope.$watch(attrs.value, (value) => {
      if (value) {
        element.css('color', 'red');
      }
    });
  }
}));
{% endhighlight %}

Now, with the following HTML, can you guess what the colour is?

{% highlight html %}
<green-if value="true">
  <red-if value="true">
    What colour am I?
  </red-if>
</green-if>
{% endhighlight %}

The answer is of course red!

Hopefully I've convinced you, at least a little bit, on why limiting directives
to elements makes them much simpler.

In a future post, I will expand more on component patterns and how they can be
applied to Angular 1 directives.
