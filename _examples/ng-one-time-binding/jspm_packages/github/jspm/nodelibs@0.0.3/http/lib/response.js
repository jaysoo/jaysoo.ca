/* */ 
"format cjs";function parseHeaders(e){for(var t=e.getAllResponseHeaders().split(/\r?\n/),r={},n=0;n<t.length;n++){var i=t[n];if(""!==i){var o=i.match(/^([^:]+):\s*(.*)/);if(o){var s=o[1].toLowerCase(),a=o[2];void 0!==r[s]?isArray(r[s])?r[s].push(a):r[s]=[r[s],a]:r[s]=a}else r[i]=!0}}return r}var Stream=require("../../stream"),util=require("../../util"),Response=module.exports=function(){this.offset=0,this.readable=!0};util.inherits(Response,Stream);var capable={streaming:!0,status2:!0};Response.prototype.getResponse=function(e){var t=String(e.responseType).toLowerCase();return"blob"===t?e.responseBlob||e.response:"arraybuffer"===t?e.response:e.responseText},Response.prototype.getHeader=function(e){return this.headers[e.toLowerCase()]},Response.prototype.handle=function(e){if(2===e.readyState&&capable.status2){try{this.statusCode=e.status,this.headers=parseHeaders(e)}catch(t){capable.status2=!1}capable.status2&&this.emit("ready")}else if(capable.streaming&&3===e.readyState){try{this.statusCode||(this.statusCode=e.status,this.headers=parseHeaders(e),this.emit("ready"))}catch(t){}try{this._emitData(e)}catch(t){capable.streaming=!1}}else 4===e.readyState&&(this.statusCode||(this.statusCode=e.status,this.emit("ready")),this._emitData(e),e.error?this.emit("error",this.getResponse(e)):this.emit("end"),this.emit("close"))},Response.prototype._emitData=function(e){var t=this.getResponse(e);return t.toString().match(/ArrayBuffer/)?(this.emit("data",new Uint8Array(t,this.offset)),void(this.offset=t.byteLength)):void(t.length>this.offset&&(this.emit("data",t.slice(this.offset)),this.offset=t.length))};var isArray=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};
//# sourceMappingURL=response.js.map