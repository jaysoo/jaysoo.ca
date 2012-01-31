--- 
created_at: 2009-05-07 10:24:00 -05:00
layout: post
typo_id: 18
title: Cheating on Speed Sudoku -- How to Prevent Greasemonkey Scripts
---
<p>I recently read about <a href="http://www.speedsudoku.com">Speed Sudoku</a> in a <a href="http://globeandmail.com">Globe and Mail</a> article. It's a website that allows player to compete against each other in a race to solve Sudoku puzzles. Players are given points based on their performance in a game -- I'm unsure how the point system works -- and these points are used to rank them on the scoreboard. As of this writing, the top player is named "WaterlooMathie" (woot for <a href="http://uwaterloo.ca/">Waterloo</a>).</p>
<p>Anyway. I decided to write a Greasemonkey script to automatically solve these puzzles. The technique I chose is a simple <a href="http://en.wikipedia.org/wiki/Backtracking">Backtracking</a> algorithm with cells chosen based on the Most Restrained Variable. *Disclaimer: I'm not planning on climbing to the top of the scoreboard using this script, it's just for fun.</p>
<p>[<a href="http://static.jackhsu.com/greasemonkey/sudoku.js">See script here</a>]</p>
<p>Nothing too fancy. In fact, the code can be tuned further to perform better -- meh. But the results are pretty good. I'm able to solve the <em>Very Hard</em> puzzles on my Mac instantly on page load.</p>
<p>Even though I'm not going to cheat on Speed Sudoku, I'm sure others will, or already have. In fact, you can report users you suspect of cheating to the site admins.</p>
<p>This raises a question for me: How do you prevent Greasemonkey scripts from executing on your website?</p>
<p>The answer lies with <em>how </em>Greasemonkey scripts are fired -- it listens to the <code>DomContentLoaded</code> event. To script execution you simply put this piece of code at the top of your page.</p>
<pre class="brush: js">
document.addEventListener("DOMContentLoaded", function(ev) {
    ev.stopPropagation();
}, false);
</pre>
<p>This will attach your anonymous function to the same event listener (which will execute first), and we simply need to stop the event from propagating.</p>
<p>You might run into cases where you <em>do</em> want your own functions (attached to <code>DOMContentLoaded</code> event) to fire. In these cases, you could create your own custom events, listen on those, and fire them in the anonymous function after.</p>
<p>Of course, users can still cheat by other means, but at least this can prevent Greasemonkey cheats. That said, I'm against prevent Greasemonkey scripts. I love the addon, and it adds functionality to websites that I can't live without.</p>

