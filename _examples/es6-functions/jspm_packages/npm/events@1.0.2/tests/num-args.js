/* */
"format cjs";var assert=require("github:jspm/nodelibs@0.0.3/assert"),events=require("../index"),e=new events.EventEmitter,num_args_emited=[];e.on("numArgs",function(){var e=arguments.length;console.log("numArgs: "+e),num_args_emited.push(e)}),console.log("start"),e.emit("numArgs"),e.emit("numArgs",null),e.emit("numArgs",null,null),e.emit("numArgs",null,null,null),e.emit("numArgs",null,null,null,null),e.emit("numArgs",null,null,null,null,null),assert.deepEqual([0,1,2,3,4,5],num_args_emited);
//# sourceMappingURL=num-args.js.map