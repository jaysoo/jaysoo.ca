--- 
created_at: 2013-10-26 12:08Z
layout: post
typo_id: 1
title: Building Webapps in Django with Angular and Grunt
tags: [javascript, python, django, angular, grunt]
---

For years, the go-to Django plugin for asset optimization has been
[https://github.com/jezdez/django_compressor](django-compressor).
However, with the growing complexity of frontend frameworks, asset
management has become a problem that requires growing sophistication.

One problem I have been faced with is how to manage the compilation
of [http://angularjs.org](AngularJS) templates/partials for production
while not requiring a build step when I'm doing development.

In this post I will show you how to setup a new project using the AngularJS
[http://yeoman.io](Yeoman) generator, and making modifications to
seemlessly integrate it into your Django app.

## Getting Started

Let's install the required [http://nodejs.org](Node) modules.

If you don't have Node installed please visit their website and follow
the instructions there. You can also install Node through
[https://github.com/mxcl/homebrew](Homebrew) if you're on OS X.

    sudo npm install -g yo yo-angular

You should now have access to the `yo` command. Try it out!


## Setting Up Angular App With Yeoman

Make a new project directory and use Yeoman to create your project
template.


    mkdir my-app && cd my-app
    yo angular

You will be prompted to require Bootstrap. You can say yes or no,
we're not going to cover stylesheets in this blog post.

Next prompt is for which Angular modules you would like to include.
You will likely need all of them, so just hit Enter to continue.

After the script has finished running you should see a bunch of
files and directories generated for you.

You can test out the app by running `grunt server`, which will open
the app in your browser.


## Tying Together Grunt, Angular, and Django

There are some modifications we should make before making a new Django app.

First, we will rename the `app` folder to `client`.

    mv app client

Next, modify the Gruntfile.js


