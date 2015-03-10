---
created_at: 2015-03-05 22:23Z
layout: post
title: Different Approach to Angular Directives: Ideas from React
tags: [javascript, angular]
---

I have been doing Angular development for nearly two years now. In those two
years, the framework has gone through changes. And along with the framework,
I've also adopted the way I write Angular applications based on things I've
learned along the way.

Nowadays, I've been doing deeper dives into other libraries and frameworks to
see what other communities have been doing to solve the same problems. One of
such libraries is [React](http://facebook.github.io/react/).

Even though Angular 2 is on the horizon, there is still a lot of juice left
in Angular 1. So let's see what we can change about the way we write directives.

## Coordinating Component vs UI Component

```js
m.directive('shoppingCartTable', () => ({
  template: `
    <table>
    </table>
  `
}));
```
