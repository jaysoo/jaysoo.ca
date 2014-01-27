---
created_at: 2014-01-26 09:35Z
layout: post
title: Grunt vs Gulp -- Build System Showdown
tags: [javascript, assets, gruntjs, gulpjs]
---

<blockquote>
  <p>Just when you think that you're in control,</p>
  <p>Just when you think that you've got a hold,</p>
  <p>Just when you get on a roll,</p>
  <p>Here it goes, here it goes, here it goes again.</p>
  <p><cite> OK Go - Here It Goes Again</cite></p>
</blockquote>

And so the evolution of front-end development continues with Gulp,
the new build system that has already garnered praise amongst many
web developers.

After spending some time reading the docs and playing around with
Gulp, I've finally decideded to test its adoption in an existing
project that currently uses Grunt.

## Initial Comparison

One of the pain points I've experienced with Grunt is the over-configuration
of simple tasks. Take stylesheet compilation for example. My source files are
written in SCSS, which needs to be compiled into CSS files, then concatenated
into a single CSS stylesheet (`styles.css`) for inclusion on the website.

Here's how I might accomplish this task in both Grunt and Gulp.

**Grunt:**

*Gruntfile.js*

{% highlight javascript %}
//...
grunt.initConfig({
 compass: {
    dist: {
      options: {
        sassDir: 'app/styles',
        cssDir: '.tmp/styles'
      }
    }
  },
  concat: {
    styles: {
      src: ['.tmp/styles/**/*.css'],
      dest: 'dist/styles.css',
    }
  }
  //...
});
//...
grunt.registerTask('styles', ['compass', 'concat:styles']);
{% endhighlight %}

**Gulp**

*Gulpfile.js*
{% highlight javascript %}
//...
gulp.task('sass', function () {
  gulp.src('./client/app/styles/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./gulp-css'));
});
//...
{% endhighlight %}

A small note to make here is how much more succinct the Gulpfile is
compared to the Gruntfile. This is more of a matter of preference, so
I don't think it's a very important consideration.

My main problem with the Grunt setup is the need to write into `.tmp`.


## Speed Comparison

*Grunt Flow*
<img src="/images/grunt-flow.png" alt="Grunt flow" />


*Gulp Flow*
<img src="/images/gulp-flow.png" alt="Gulp flow" />
