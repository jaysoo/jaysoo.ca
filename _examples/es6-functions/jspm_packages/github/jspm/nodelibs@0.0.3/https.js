/* */ 
"format cjs";var http=require("./http"),https=module.exports;for(var key in http)http.hasOwnProperty(key)&&(https[key]=http[key]);https.request=function(e,t){return e||(e={}),e.scheme="https",http.request.call(this,e,t)};
//# sourceMappingURL=https.js.map