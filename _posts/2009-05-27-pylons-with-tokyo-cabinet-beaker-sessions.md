--- 
created_at: 2009-05-27 15:20:00 -05:00
layout: post
typo_id: 20
title: Pylons with Tokyo Cabinet Beaker Sessions
---
<p>Maintaining a session is something most web apps need to do, and all web frameworks implement some sort of session management system.</p>
<p><a href="http://pylonshq.com/">Pylons</a> allows you to specify the type of session your web app should use: database, file, memcached, etc. The great thing about it is that you can easily implement your own session manager and plug it right in.</p>
<p>Here I am implementing a session manager that uses <a href="http://tokyocabinet.sourceforge.net/">Tokyo Cabinet</a> and <a href="http://json.org">JSON</a> (instead of cPickle). The simplejson module now has speedups that use C extensions so load and dump are more or less on par with cPickle. With JSON serialization you'll be able to share the session data in apps written in other languages (such as Java, Perl, Ruby).</p>
<p>Tokyo Cabinet is a class of DBM that is a key-value store. It differs from RDBMS in that data are stored solely as key-value pairs, with no relations to each other. The advantage over RDBMS is that Tokyo Cabinet is lightning fast in comparison. If you're familiar with memcached, you can think of it like memcached except with persistent data. Since sessions need to be accessed frequently, and sessions are essentially key-value pairs -- a key/namespace mapping to a session object -- I thought it'd be a good candidate to use Tokyo Cabinet.</p>
<p>Assuming you already have a Pylons project setup, let's create a file under [project path]/lib/ called <em>tcjson.py</em> (Tokyo Cabinet JSON... get it?), and fill it with the following.</p>
<pre class="brush: py">
import logging

from beaker.container import NamespaceManager, Container
from beaker.synchronization import file_synchronizer
from beaker.util import verify_directory

try:
    from pytyrant import PyTyrant
except ImportError:
        raise InvalidCacheBackendError("PyTyrant cache backend requires the 'pytyrant' library")

try:
    import json
except ImportError:
    try: 
        import simplejson as json
    except ImportError:
        raise InvalidCacheBackendError("PyTyrant cache backend requires the 'simplejson' library")

log = logging.getLogger(__name__)

class TokyoCabinetManager(NamespaceManager):
    def __init__(self, namespace, url=None, data_dir=None, lock_dir=None, **params):
        NamespaceManager.__init__(self, namespace)
       
        if not url:
            raise MissingCacheParameter("url is required") 
        
        if lock_dir:
            self.lock_dir = lock_dir
        elif data_dir:
            self.lock_dir = data_dir + "/container_tcd_lock"
        if self.lock_dir:
            verify_directory(self.lock_dir)            
        
        host, port = url.split(':')
        self.tc = PyTyrant.open(host, int(port))

    def get_creation_lock(self, key):
        return file_synchronizer(
            identifier ="tccontainer/funclock/%s" % self.namespace,
            lock_dir = self.lock_dir)

    def _format_key(self, key):
        return self.namespace + '_'  

    def __getitem__(self, key):
        return json.loads(self.tc.get(self._format_key(key)))

    def __contains__(self, key):
        return self.tc.has_key(self._format_key(key))

    def has_key(self, key):
        return key in self

    def set_value(self, key, value):
        self.tc[self._format_key(key)] =  json.dumps(value)

    def __setitem__(self, key, value):
        self.set_value(key, value)
        
    def __delitem__(self, key):
        del self.tc[self._format_key(key)]

    def do_remove(self):
        self.tc.clear()
    
    def keys(self):
        raise self.tc.keys()


class TokyoCabinetContainer(Container):
    namespace_manager = TokyoCabinetManager
</pre>
<p>Now, put this in your <em>[project path]/config/environment.py</em> file.</p>
<pre class="brush: py">
import investor.lib.tcjson as tcjson 
import beaker
beaker.cache.clsmap['ext:tcjson'] = tcjson.TokyoCabinetManager
</pre>
<p>You can then specify <em>ext:tcjson</em> as your beaker session in your INI file (e.g. development.ini).</p>
<pre class="brush: py">
beaker.session.type = ext:tcjson
beaker.session.url = 127.0.0.1:1978
</pre>
<p>Fire up your app and it should be using Tokyo Cabinet for your sessions! :)</p>

