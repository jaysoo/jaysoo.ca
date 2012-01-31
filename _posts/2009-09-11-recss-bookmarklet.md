--- 
created_at: 2009-09-11 09:04:00 -05:00
layout: post
typo_id: 26
title: ReCSS Bookmarklet
---
<p>I've been using this <a href="javascript:void(function(){var%20i,a,s;a=document.getElementsByTagName('link');for(i=0;i<a.length;i++){s=a[i];if(s.rel.toLowerCase().indexOf('stylesheet')>=0&&s.href)%20{var%20h=s.href.replace(/(&|%5C?)forceReload=\d+/,'');s.href=h+(h.indexOf('?')>=0?'&':'?')+'forceReload='+(new%20Date().valueOf())}}})();">ReCSS bookmarkle</a>t for a long time now... it's one of the best tools I've found on the web. You drag-and-drop the bookmarket to your bookmarks toolbar, and when you need to force-reload the CSS on a page, just click on it and viola! No need to reload the entire page to see updated stylesheets.</p>
<p>Originally found on <a href="http://www.dojotoolkit.org/~david/recss.html">http://www.dojotoolkit.org/~david/recss.html</a>.</p>
