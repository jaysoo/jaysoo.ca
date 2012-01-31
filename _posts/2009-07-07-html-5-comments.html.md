--- 
created_at: 2009-07-07 10:51:00 -05:00
layout: post
typo_id: 21
title: HTML 5 Comments
tags: 
- html5 comments html
---
<p>One change that I think most people are overlooking is the change to HTML comments in HTML 5. If you read the <a href="http://dev.w3.org/html5/spec/#comments">working draft</a> of the HTML 5 spec, you'll notice that previously valid comment markup may no longer be valid in HTML 5.</p>
<p>Here is definition from HTML 5:</p>
<blockquote>
<p><dfn title="syntax-comments" id="syntax-comments">Comments</dfn> must start with the four character sequence U+003C LESS-THAN SIGN, U+0021 EXCLAMATION MARK, U+002D HYPHEN-MINUS, U+002D HYPHEN-MINUS (<code title=""><!--</code>). Following this sequence, the comment may   have <a title="syntax-text" href="http://dev.w3.org/html5/spec/#syntax-text">text</a>, with the additional restriction that the text must not start with a single U+003E GREATER-THAN SIGN ('>') character, nor start with a U+002D HYPHEN-MINUS (<code title="">-</code>) character followed by a   U+003E GREATER-THAN SIGN ('>') character, nor contain two   consecutive U+002D HYPHEN-MINUS (<code title="">-</code>)   characters, nor end with a U+002D HYPHEN-MINUS (<code title="">-</code>) character. Finally, the comment must be ended by the three character sequence U+002D HYPHEN-MINUS, U+002D HYPHEN-MINUS, U+003E GREATER-THAN SIGN (<code title="">--></code>).</p>
</blockquote>
<p>Compared to HTML 4:</p>
<blockquote>
<p>White space is not permitted between the markup declaration open delimiter(""). A common error is to include a string of hyphens ("---") within a comment. Authors should avoid putting two or more adjacent hyphens inside comments.</p>
<p>Information that appears between comments has no special meaning (e.g., <a href="http://www.w3.org/TR/html4/intro/sgmltut.html#character-entities">character references</a> are not interpreted as such).</p>
<p>Note that comments are markup.</p>
</blockquote>
<p>The main difference is that having dash-dash (--) within a comment is longer acceptable. In HTML 4, you can nest any number of opening and closing delimeters (--), which can cause unwanted behavious for web authors who do not know the comment definition that well.</p>
<p>For example, take a look at this chunk of HTML:</p>
<pre>
<!-- bad comment -- -->
<p>Hello, World</p>
<!--p>Hide me!</p-->
</pre>
<p>&nbsp;It seems to show the paragraph "Hello, World" and hide the second "Hide me!" paragraph. However, because the first comment contains two consecutive dashes within it's text, the --> no longer closes the entire comment. Rather, it treats the second paragraph as part of the comment text, and once it parses <!--p-->, those two dashes finally closes the initial comment block.</p>
<p>In HTML 5, the first comment would be invalid markup. I don't think any browsers implement this yet, and I'm not sure how invalid comment markup would be handled.</p>
<p>Note: I only saw this behaviour in Firefox, and not in IE nor Safari. It's actually a bug in those browsers to not parse the comment tag properly.</p>
<p>&nbsp;</p>

