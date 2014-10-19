/* */
"format cjs";"use strict";function Dispatcher(){this.$Dispatcher_callbacks={},this.$Dispatcher_isPending={},this.$Dispatcher_isHandled={},this.$Dispatcher_isDispatching=!1,this.$Dispatcher_pendingPayload=null}var invariant=require("./invariant"),_lastID=1,_prefix="ID_";Dispatcher.prototype.register=function(i){var t=_prefix+_lastID++;return this.$Dispatcher_callbacks[t]=i,t},Dispatcher.prototype.unregister=function(i){invariant(this.$Dispatcher_callbacks[i],"Dispatcher.unregister(...): `%s` does not map to a registered callback.",i),delete this.$Dispatcher_callbacks[i]},Dispatcher.prototype.waitFor=function(i){invariant(this.$Dispatcher_isDispatching,"Dispatcher.waitFor(...): Must be invoked while dispatching.");for(var t=0;t<i.length;t++){var a=i[t];this.$Dispatcher_isPending[a]?invariant(this.$Dispatcher_isHandled[a],"Dispatcher.waitFor(...): Circular dependency detected while waiting for `%s`.",a):(invariant(this.$Dispatcher_callbacks[a],"Dispatcher.waitFor(...): `%s` does not map to a registered callback.",a),this.$Dispatcher_invokeCallback(a))}},Dispatcher.prototype.dispatch=function(i){invariant(!this.$Dispatcher_isDispatching,"Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch."),this.$Dispatcher_startDispatching(i);try{for(var t in this.$Dispatcher_callbacks)this.$Dispatcher_isPending[t]||this.$Dispatcher_invokeCallback(t)}finally{this.$Dispatcher_stopDispatching()}},Dispatcher.prototype.isDispatching=function(){return this.$Dispatcher_isDispatching},Dispatcher.prototype.$Dispatcher_invokeCallback=function(i){this.$Dispatcher_isPending[i]=!0,this.$Dispatcher_callbacks[i](this.$Dispatcher_pendingPayload),this.$Dispatcher_isHandled[i]=!0},Dispatcher.prototype.$Dispatcher_startDispatching=function(i){for(var t in this.$Dispatcher_callbacks)this.$Dispatcher_isPending[t]=!1,this.$Dispatcher_isHandled[t]=!1;this.$Dispatcher_pendingPayload=i,this.$Dispatcher_isDispatching=!0},Dispatcher.prototype.$Dispatcher_stopDispatching=function(){this.$Dispatcher_pendingPayload=null,this.$Dispatcher_isDispatching=!1},module.exports=Dispatcher;
//# sourceMappingURL=Dispatcher.js.map