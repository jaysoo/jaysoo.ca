/* */ 
"format cjs";module.exports=function(){var e=require("./events"),t={};return t.createDomain=t.create=function(){var t=new e.EventEmitter;return t.run=function(e){try{e()}catch(t){this.emit("error",t)}return this},t.dispose=function(){return this.removeAllListeners(),this},t},t}.call(this);
//# sourceMappingURL=domain.js.map