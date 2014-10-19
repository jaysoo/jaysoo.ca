/* */ 
"format cjs";
var assert = require("github:jspm/nodelibs@0.0.3/assert");
var events = require("../index");
var e = new events.EventEmitter;
assert.deepEqual(e._events, {});
e.setMaxListeners(5);
assert.deepEqual(e._events, {});
