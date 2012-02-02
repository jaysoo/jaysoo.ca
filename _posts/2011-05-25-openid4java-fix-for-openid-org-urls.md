--- 
created_at: 2011-05-25 09:52:00 -05:00
layout: post
typo_id: 44
title: openid4java Fix For openid.org URLs
tags: [openid, openid4java, java]
---
<p>We were having trouble at work with our OpenID login. When a user tried to sign in with an openid.org URL, openid4java would try an YadisException.</p>
<p>After trying other OpenID RPs like <a href="http://stackoverflow.com/">StackOverflow</a> or Disqus, it seems it's not a common problem for most people. So I started digging through the openid4java source code, and I found a solution for this.</p>
<p>In the YadisResolver.discover method, the retrieval of the XRDS document fails (HTTP 404). Yes, this is openid.org's fault, but it's still not satisfactory for us to not support it. Below is my edit to the method to make it work (starting at line 252)</p>

{% highlight java %}
if (result.getXrdsLocation() != null)
{
    try {
        retrieveXrdsDocument(result, maxRedirects, serviceTypes);
    } catch (YadisException e) {
        _log.debug("XRDS retrieval failed, trying GET");
        result = retrieveXrdsLocation(yadisUrl, true, maxRedirects, serviceTypes);
        if (result.hasEndpoints()) {
            result.setXrdsLocation(url, OpenIDException.YADIS_INVALID_URL);
        } else {
            throw e;
        }
    }
}
{% endhighlight}

<p>I also made a repo on github for this, which also includes a download for the JAR file.: <a href="https://github.com/jaysoo/openid4java-openidorgfix">https://github.com/jaysoo/openid4java-openidorgfix</a>.</p>
