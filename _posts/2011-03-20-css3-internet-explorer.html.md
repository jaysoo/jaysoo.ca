--- 
created_at: 2011-03-20 18:39:00 -05:00
layout: post
typo_id: 41
title: CSS3 for Internet Explorer
---
<p>I have been using a lot of CSS3 in my projects this past year. CSS3 makes it much easier to implement design elements such as rounded corners, non-native fonts, etc.</p>
<p>The only problem with the CSS3 approach is that support for it differs among the major browsers. In most cases, it's just a matter of using different vendor prefixes (<code>-webkit</code> vs. <code>-moz</code> vs <code>-o</code>). Internet Explorer (IE 6-8) though, is a whole other story.</p>
<p>Luckily, there are a few work arounds for getting your CSS3 styles to work in IE.</p>
<h3>border-radius, box-shadow, text-shadow</h3>
<p>Thanks for&nbsp;<a href="http://www.htmlremix.com/css/curved-corner-border-radius-cross-browser">Remiz Rahnas</a>&nbsp;for providing a way to easily support three very widely used CSS3 properties. <a href="http://fetchak.com/ie-css3/"><strong>Grab the ie-css3 script from this page</strong></a>, and simply add <code>behavior: url(ie-css3.htc)</code> in your styles. It's that easy. :)</p>
<h3>@font-face</h3>
<p>Use the Font Squirrel <a href="http://www.fontsquirrel.com/fontface/generator">@font-face generator</a>&nbsp;to create cross-browser and optimized font formats and stylesheet. You can also browse through their collection of font packs to see if you can find what you're looking for. The IE support goes all the way back to IE 4, so there should be <em>no </em>reason to not use embedded fonts.&nbsp;</p>
<h3>transform: rotate(...)</h3>
<p>Let's say you need to rotate an element 30 degrees clockwise using CSS3.</p>
<p>In Chrome and Safari you will use <code>-webkit-transform: rotate(30deg)</code>. In Firefox you will use <code>-moz-transform: rotate(30deg)</code>. In Opera you will use <code>-o-transform(30deg)</code>. Easy right?</p>
<p>But what about IE? Some websites recommend using the <a href="http://msdn.microsoft.com/en-us/library/ms532918(v=vs.85).aspx">rotation filter property</a>. This property only allows for four rotations: 0, 90, 180, and 270 degrees. Well, that sucks right?</p>
<p>The good news is that IE supports <a href="http://en.wikipedia.org/wiki/Transformation_matrix">matrix transformations</a>, and rotation is just a linear transformation. I found this useful <a href="http://www.boogdesign.com/examples/transforms/matrix-calculator.html">calculator online</a> that allows you to input the degree, and it will spit of the matrix values along with the corresponding CSS -- the rules you want are <code>filter</code> and <code>-ms-filter</code>.</p>
<h3>opacity</h3>
<p>To get opacity to work in IE, use the alpha filter.</p>
<pre>
filter: progid:DXImageTransform.Microsoft.Alpha(opacity=50); /* IE 6,7 */
-ms-filter: progid:DXImageTransform.Microsoft.Alpha(opacity=50); /* IE 8 */</pre>
<p>&nbsp;The <code>opacity</code> value ranges from 0 to 100, where 0 is invisible and 100 is full opacity.</p>
<h3>gradient</h3>
<p>Use the proprietary <a href="http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx">gradient</a>&nbsp;filter.</p>
<pre>
filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0,
    startColorstr='#cccccc', endColorstr='#ffffff');
</pre>
<p>The <code>GradientType</code> can be <code>0</code> for horizontal or <code>1</code> for vertical. Notice that you can only specify linear gradients.</p>
<p>&nbsp;</p>

