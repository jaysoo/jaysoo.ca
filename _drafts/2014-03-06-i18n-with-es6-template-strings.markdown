---
created_at: 2014-03-06 23:00Z
layout: post
title: i18n and l10n with tagged template strings in EcmaScript 6
tags: [javascript, es6]
draft: true
---

One of the new features coming to EcmaScript 6 (ES6), the next version of JavaScript standards, is the template string.

{% highlight javascript %}
function i10n(literals, ...values) {
  var result = [];

  literals.forEach(function(literal) {
    result.push(literal + localize(values.shift()));
  });

  return result.join('');
}

function localize(value) {
  if (value === undefined) return '';

  if (value instanceof Date) return new Intl.DateTimeFormat().format(value);

  if (value instanceof Number) return new Intl.NumberFormat().format(value);

  return value;
}

var name = 'Bob';
var amount = 10.75
var date = new Date();

var x = i10n`Hello ${name}! You have ${amount} as of ${date}.`;

console.log(x);

{% endhighlight %}
