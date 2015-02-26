/* */ 
"format cjs";
var assert = require("github:jspm/nodelibs@0.0.3/assert");
var events = require("../index");
var gotEvent = false;
var e = new events.EventEmitter();
e.on('maxListeners', function() {
  gotEvent = true;
});
e.setMaxListeners(42);
assert.throws(function() {
  e.setMaxListeners(NaN);
});
assert.throws(function() {
  e.setMaxListeners(-1);
});
assert.throws(function() {
  e.setMaxListeners("and even this");
});
e.emit('maxListeners');
assert(gotEvent);
