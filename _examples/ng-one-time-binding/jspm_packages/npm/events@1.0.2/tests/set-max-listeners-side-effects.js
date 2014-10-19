/* */
"format cjs";var assert=require("github:jspm/nodelibs@0.0.3/assert"),events=require("../index"),e=new events.EventEmitter;assert.deepEqual(e._events,{}),e.setMaxListeners(5),assert.deepEqual(e._events,{});
//# sourceMappingURL=set-max-listeners-side-effects.js.map