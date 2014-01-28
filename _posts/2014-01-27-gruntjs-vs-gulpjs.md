---
created_at: 2014-01-27 23:45Z
layout: post
title: Grunt vs Gulp - Beyond the Numbers
tags: [javascript, gruntjs, gulpjs]
---

<blockquote>
  <p>Just when you think that you're in control,</p>
  <p>Just when you think that you've got a hold,</p>
  <p>Just when you get on a roll,</p>
  <p>Here it goes, here it goes, here it goes again.</p>
  <p><cite> OK Go - Here It Goes Again</cite></p>
</blockquote>


<small>*Edited on 2014/01/28: I added timing numbers for comparison, although it's not my real
focus of this post.*</small>

And so the evolution of front-end development continues with Gulp,
the new build system that has already garnered praise amongst many
web developers.

After spending some time reading the docs and playing around with
Gulp, I've finally decided to test its adoption in an existing
project that currently uses Grunt. From what I've seen so far,
Gulp is blazingly fast when compared to Grunt for similar tasks.

Let's dig a bit deeper though, and get a little understanding of the
differences between Grunt and Gulp, beyond superficial speed comparisons.

In this post we'll cover:
- A shallow dive into Gulp, and how it compares with Grunt.
- Things to consider when choosing between the two tools.

## First Impression

One of the pain points I've experienced with Grunt is the over-configuration
of simple tasks. Take stylesheet compilation for example. My source files are
written in SCSS, which needs to be compiled into CSS files, then I want to run
the files through an autoprefixer for vendor prefixes. And I want this to run
each time my source files change.

Here's how I might accomplish this task in both Grunt and Gulp.

*Gruntfile.js*

{% highlight javascript %}
grunt.initConfig({
 compass: {
    dist: {
      options: {
        sassDir: 'app/styles',
        cssDir: '.tmp/styles'
      }
    }
  },
  autoprefixer: {
    options: ['last 1 version'],
    dist: {
      files: [
        {
          expand: true,
          cwd: '.tmp/styles',
          src: '{,*/}*.css',
          dest: 'dist/styles'
        }
      ]
    }
  },
  watch: {
    styles: {
      files: ['app/styles/{,*/}*.scss'],
      tasks: ['compass:dist', 'autoprefixer:dist']
    }
  }
});
grunt.registerTask('default', ['compass:dist', 'concat:styles', 'watch']);
{% endhighlight %}

*Gulpfile.js*
{% highlight javascript %}
gulp.task('sass', function () {
  gulp.src('app/styles/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer('last 1 version'))
    .pipe(gulp.dest('dist/styles'));
});
gulp.task('default', function() {
  gulp.run('sass');
  gulp.watch('app/styles/**/*.scss', function() {
    gulp.run('sass');
  });
});
{% endhighlight %}

As you can see, in Gulp we do not need the intermediary `.tmp` folder to
store the compiled, unprefixed CSS files. This means a little bit less configuration,
and saves on I/O.

Now for some time comparisons. Gulp reported that it was able to process file changes
in **2.13ms** on my machine, versus the **1.825s** it took Grunt.

<figure>
  <figcaption>
    Timing numbers reported by Grunt
  </figcaption>
  <img src="/images/grunt-compile.png" alt="Grunt timing">
</figure>

<span></span>

<figure>
  <figcaption>
    Timing numbers reported by Gulp
  </figcaption>
  <img src="/images/gulp-compile.png" alt="Gulp timing">
</figure>

The timing reported by both tools are *not comparable* though because they use different mechanisms.
If I use `time` on both tasks (SASS compile + autoprefixer), then the numbers are much closer:
**0.641ms** for Gulp and **1.718s** for Grunt.

## Streams all the way down

To understand Gulp you need to understand Node Streams. All Gulp plugins are
just duplex streams that read in data and output data. Everything can be processed
in memory, with the output of one stream piped as input to another. Much like Unix pipes.

This gives Gulp a huge speed advantage over Grunt, because I/O is very expensive when
compared to in-memory operations. On top of that, Grunt has to compile all the files even if
only one has changed, which adds additional build time.

<figure>
  <figcaption>
    In Grunt, we must write intermediary files to disk
  </figcaption>
  <img src="/images/grunt-flow.png" alt="Grunt flow">
</figure>

<span></span>

<figure>
  <figcaption>
    In Gulp, we pipe the intermediary files in-memory to other streams
  </figcaption>
  <img src="/images/gulp-flow.png" alt="Gulp flow">
</figure>

This also means that Gulp plugins are really just map-streams. Compare this with Grunt, which has
plugins of all sorts, such as running a livereload server. In Gulp, you will need to do some Node
programming to do the same thing.

Example from [gulp-reload](https://npmjs.org/package/gulp-livereload):
{% highlight javascript %}
var lr = require('tiny-lr'),
    gulp = require('gulp'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    server = lr();

gulp.task('less', function () {
  gulp.src('less/*.less')
    .pipe(less())
    .pipe(gulp.dest('css'))
    .pipe(livereload(server));
});

gulp.task('watch', function () {
  server.listen(35729, function (err) {
    if (err) return console.log(err);

    gulp.watch('less/*.less', function () {
        gulp.run('less');
    });
  });
});
{% endhighlight %}

## Okay, but which is better?

Unfortunately, I can't tell you which tool is better because that is a matter of preference.

I expect the **speed gap** between Grunt and Gulp to be much closer once Grunt 0.5 lands. The [roadmap
for Grunt 0.5](https://github.com/gruntjs/grunt-docs/blob/master/Roadmap.md) includes adding support for
piping data between multiple tasks, and emitting task output as data events. This can speed up tasks
quite significantly, and might mean that configuration can be more succinct without the need of temporary
files.

One advantage that Grunt currently has over Gulp is a much wider **community support**, with a lot
more plugins available for it. This, of course, can change in the future as more developers adopt Gulp,
but remember that Gulp plugins are very different from Grunt plugins so don't expect the exact same ones
to be ported over to Gulp.

The **most important question** to ask yourself is which philosophy do you subscribe to more? Do you
like a build system that prefers *code* over *configuration*? If so, then you may feel right at home
with Gulp. Otherwise, stick with Grunt.


## Further Reading & Information

- [GulpJS](http://gulpjs.com/)
- [GruntJS](http://gruntjs.com/)
- [Gulp, Grunt, Whatever](http://blog.ponyfoo.com/2014/01/09/gulp-grunt-whatever)
- [And just like that Grunt and RequireJS are out, it's all about Gulp and Browserify now](http://www.100percentjs.com/just-like-grunt-gulp-browserify-now/)
- [Speedtesting gulp.js and Grunt](http://labs.tmw.co.uk/2014/01/speedtesting-gulp-and-grunt/)
