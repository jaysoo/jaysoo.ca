/*
 * SystemJS v0.8.1
 */

!function($__global){$__global.upgradeSystemLoader=function(){function parseURI(e){var t=String(e).replace(/^\s+|\s+$/g,"").match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);return t?{href:t[0]||"",protocol:t[1]||"",authority:t[2]||"",host:t[3]||"",hostname:t[4]||"",port:t[5]||"",pathname:t[6]||"",search:t[7]||"",hash:t[8]||""}:null}function toAbsoluteURL(e,t){function a(e){var t=[];return e.replace(/^(\.\.?(\/|$))+/,"").replace(/\/(\.(\/|$))+/g,"/").replace(/\/\.\.$/,"/../").replace(/\/?[^\/]*/g,function(e){"/.."===e?t.pop():t.push(e)}),t.join("").replace(/^\//,"/"===e.charAt(0)?"/":"")}return t=parseURI(t||""),e=parseURI(e||""),t&&e?(t.protocol||e.protocol)+(t.protocol||t.authority?t.authority:e.authority)+a(t.protocol||t.authority||"/"===t.pathname.charAt(0)?t.pathname:t.pathname?(e.authority&&!e.pathname?"/":"")+e.pathname.slice(0,e.pathname.lastIndexOf("/")+1)+t.pathname:e.pathname)+(t.protocol||t.authority||t.pathname?t.search:t.search||e.search)+t.hash:null}function meta(e){function t(e,t){var a=e.meta&&e.meta[t.name];if(a)for(var r in a)t.metadata[r]=t.metadata[r]||a[r]}var a=/^(\s*\/\*.*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/,r=/\/\*.*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;e.meta={};var n=e.locate;e.locate=function(e){return t(this,e),n.call(this,e)};var o=e.translate;e.translate=function(e){var n=e.source.match(a);if(n)for(var i=n[0].match(r),l=0;l<i.length;l++){var s=i[l].length,d=i[l].substr(0,1);if(";"==i[l].substr(s-1,1)&&s--,'"'==d||"'"==d){var u=i[l].substr(1,i[l].length-3),c=u.substr(0,u.indexOf(" "));if(c){var f=u.substr(c.length+1,u.length-c.length-1);e.metadata[c]instanceof Array?e.metadata[c].push(f):e.metadata[c]||(e.metadata[c]=f)}}}return t(this,e),o.call(this,e)}}function register(e){function t(e){var t=this;"@traceur"==e.name&&(f=System);var a,r=e.source.lastIndexOf("\n");-1!=r&&"//# sourceMappingURL="==e.source.substr(r+1,21)&&(a=e.source.substr(r+22,e.source.length-r-22),"undefined"!=typeof toAbsoluteURL&&(a=toAbsoluteURL(e.address,a))),__eval(e.source,e.address,a),"@traceur"==e.name&&(t.global.traceurSystem=t.global.System,t.global.System=f)}function a(e){for(var t=[],a=0,r=e.length;r>a;a++)-1==indexOf.call(t,e[a])&&t.push(e[a]);return t}function r(t,a,r,n){"string"!=typeof t&&(n=r,r=a,a=t,t=null),p=!0;var o;if("boolean"==typeof r)o={declarative:!1,deps:a,execute:n,executingRequire:r};else{if(a.length>0&&1!=r.length)throw"Invalid System.register form for "+t+". Declare function must take one argument.";o={declarative:!0,deps:a,declare:r}}if(t)o.name=t,e.defined[t]||(e.defined[t]=o);else if(o.declarative){if(m)throw"Multiple anonymous System.register calls in the same module file.";m=o}}function n(e){if(!e.register){e.register=r,e.defined||(e.defined={});var t=e.onScriptLoad;e.onScriptLoad=function(e){t(e),m&&(e.metadata.entry=m),(m||p)&&(e.metadata.format=e.metadata.format||"register"),p&&(e.metadata.registered=!0)}}}function o(e,t,a){if(a[e.groupIndex]=a[e.groupIndex]||[],-1==indexOf.call(a[e.groupIndex],e)){a[e.groupIndex].push(e);for(var r=0,n=e.normalizedDeps.length;n>r;r++){var i=e.normalizedDeps[r],l=t.defined[i];if(l&&!l.evaluated){var s=e.groupIndex+(l.declarative!=e.declarative);if(void 0===l.groupIndex||l.groupIndex<s){if(l.groupIndex&&(a[l.groupIndex].splice(indexOf.call(a[l.groupIndex],l),1),0==a[l.groupIndex].length))throw new TypeError("Mixed dependency cycle detected");l.groupIndex=s}o(l,t,a)}}}}function i(e,t){var a=t.defined[e];a.groupIndex=0;var r=[];o(a,t,r);for(var n=!!a.declarative==r.length%2,i=r.length-1;i>=0;i--){for(var l=r[i],d=0;d<l.length;d++){var c=l[d];n?s(c,t):u(c,t)}n=!n}}function l(e){return h[e]||(h[e]={name:e,dependencies:[],exports:{},importers:[]})}function s(e,t){if(!e.module){var a=e.module=l(e.name),r=e.module.exports,n=e.declare.call(t.global,function(e,t){a.locked=!0,r[e]=t;for(var n=0,o=a.importers.length;o>n;n++){var i=a.importers[n];if(!i.locked){var l=indexOf.call(i.dependencies,a);i.setters[l](r)}}return a.locked=!1,t});if(a.setters=n.setters,a.execute=n.execute,!a.setters||!a.execute)throw"Invalid System.register form for "+e.name;for(var o=0,i=e.normalizedDeps.length;i>o;o++){var d,u=e.normalizedDeps[o],c=t.defined[u],f=h[u];f?d=f.exports:c&&!c.declarative?d={"default":c.module.exports,__useDefault:!0}:c?(s(c,t),f=c.module,d=f.exports):d=t.get(u),f&&f.importers?(f.importers.push(a),a.dependencies.push(f)):a.dependencies.push(null),a.setters[o]&&a.setters[o](d)}}}function d(e,t){var a,r=t.defined[e];if(r)r.declarative?c(e,[],t):r.evaluated||u(r,t),a=r.module.exports;else{if(a=t.get(e),!a)throw"System Register: The module requested "+e+" but this was not declared as a dependency";a.__useDefault&&(a=a["default"])}return a}function u(e,t){if(!e.module){var a={},r=e.module={exports:a,id:e.name};if(!e.executingRequire)for(var n=0,o=e.normalizedDeps.length;o>n;n++){var i=e.normalizedDeps[n],l=t.defined[i];l&&u(l,t)}e.evaluated=!0;var s=e.execute.call(t.global,function(a){for(var r=0,n=e.deps.length;n>r;r++)if(e.deps[r]==a)return d(e.normalizedDeps[r],t)},a,r);s&&(r.exports=s)}}function c(e,t,a){var r=a.defined[e];if(!r.evaluated&&r.declarative){t.push(e);for(var n=0,o=r.normalizedDeps.length;o>n;n++){var i=r.normalizedDeps[n];-1==indexOf.call(t,i)&&(a.defined[i]?c(i,t,a):a.get(i))}r.evaluated||(r.evaluated=!0,r.module.execute.call(a.global))}}"undefined"==typeof indexOf&&(indexOf=Array.prototype.indexOf),"undefined"==typeof __eval&&(__eval=0||eval);var f;e.__exec=t;var m,p;n(e);var h={},g=/System\.register/,v=e.fetch;e.fetch=function(e){var t=this;return n(t),t.defined[e.name]?(e.metadata.format="defined",""):(m=null,p=!1,v.call(t,e))};var x=e.translate;e.translate=function(e){return this.register=r,this.__exec=t,e.metadata.deps=e.metadata.deps||[],Promise.resolve(x.call(this,e)).then(function(t){return(e.metadata.init||e.metadata.exports)&&(e.metadata.format=e.metadata.format||"global"),("register"==e.metadata.format||!e.metadata.format&&e.source.match(g))&&(e.metadata.format="register"),t})};var b=e.instantiate;e.instantiate=function(e){var t,n=this;if(n.defined[e.name])t=n.defined[e.name];else if(e.metadata.entry)t=e.metadata.entry;else if(e.metadata.execute)t={declarative:!1,deps:e.metadata.deps||[],execute:e.metadata.execute,executingRequire:e.metadata.executingRequire};else if("register"==e.metadata.format){m=null,p=!1;var o=n.global.System=n.global.System||n,l=o.register;if(o.register=r,n.__exec(e),o.register=l,m&&(t=m),!p&&!e.metadata.registered)throw e.name+" detected as System.register but didn't execute."}if(!t&&"es6"!=e.metadata.format)return{deps:[],execute:function(){return n.newModule({})}};if(!t)return b.call(this,e);n.defined[e.name]=t,t.deps=a(t.deps),t.name=e.name;for(var s=[],d=0,u=t.deps.length;u>d;d++)s.push(Promise.resolve(n.normalize(t.deps[d],e.name)));return Promise.all(s).then(function(a){return t.normalizedDeps=a,{deps:t.deps,execute:function(){i(e.name,n),c(e.name,[],n),n.defined[e.name]=void 0;var a=n.newModule(t.declarative?t.module.exports:{"default":t.module.exports,__useDefault:!0});return t.module.module=a,a}}})}}function core(e){var t=e["import"];e["import"]=function(e,a){return t.call(this,e,a).then(function(e){return e.__useDefault?e["default"]:e})},e.set("@empty",e.newModule({})),e.config=function(e){for(var t in e){var a=e[t];if("object"!=typeof a||a instanceof Array)this[t]=a;else{this[t]=this[t]||{};for(var r in a)this[t][r]=a[r]}}};var a;if("undefined"==typeof window&&"undefined"==typeof WorkerGlobalScope)a=process.cwd()+"/";else if("undefined"==typeof window)a=e.global.location.href;else if(a=document.baseURI,!a){var r=document.getElementsByTagName("base");a=r[0]&&r[0].href||window.location.href}var n,o=e.locate;e.locate=function(e){return this.baseURL!=n&&(n=toAbsoluteURL(a,this.baseURL),"/"!=n.substr(n.length-1,1)&&(n+="/"),this.baseURL=n),Promise.resolve(o.call(this,e))};var i=/^\s*export\s*\*\s*from\s*(?:'([^']+)'|"([^"]+)")/,l=/(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/,s=e.translate;e.translate=function(e){var t=this;if("@traceur"==e.name)return s.call(t,e);var a;if("es6"!=e.metadata.format&&e.metadata.format||!(a=e.source.match(i))){if(("es6"==e.metadata.format||!e.metadata.format&&e.source.match(l))&&(e.metadata.format="es6",!t.global.traceur))return t["import"]("@traceur").then(function(){return s.call(t,e)})}else e.metadata.format="cjs",e.source='module.exports = require("'+(a[1]||a[2])+'");\n';return s.call(t,e)};var d=e.instantiate;e.instantiate=function(e){var t=this;return"@traceur"==e.name?(t.__exec(e),{deps:[],execute:function(){return t.newModule({})}}):d.call(t,e)}}function global(e){function t(e){if(!e.has("@@global-helpers")){var t,a,r=e.global.hasOwnProperty,n={};e.set("@@global-helpers",e.newModule({prepareGlobal:function(o,i){for(var l=0;l<i.length;l++){var s=n[i[l]];if(s)for(var d in s)e.global[d]=s[d]}t={},a=["indexedDB","sessionStorage","localStorage","clipboardData","frames","webkitStorageInfo"];for(var u in e.global)if(-1==indexOf.call(a,u)&&(!r||e.global.hasOwnProperty(u)))try{t[u]=e.global[u]}catch(c){a.push(u)}},retrieveGlobal:function(o,i,l){var s,d,u={};if(l){for(var c=[],f=0;f<deps.length;f++)c.push(require(deps[f]));s=l.apply(e.global,c)}else if(i){var m=i.split(".")[0];s=eval.call(e.global,i),u[m]=e.global[m]}else for(var p in e.global)-1==indexOf.call(a,p)&&(r&&!e.global.hasOwnProperty(p)||p==e.global||t[p]==e.global[p]||(u[p]=e.global[p],s?s!==e.global[p]&&(d=!0):s!==!1&&(s=e.global[p])));return n[o]=u,d?u:s}}))}}t(e);var a=e.instantiate;e.instantiate=function(e){var r=this;t(r);var n=e.metadata.exports;return e.metadata.format||(e.metadata.format="global"),"global"==e.metadata.format&&(e.metadata.execute=function(t,a,o){r.get("@@global-helpers").prepareGlobal(o.id,e.metadata.deps),n&&(e.source+='\nthis["'+n+'"] = '+n+";");var i=r.global.define;return r.global.define=void 0,r.global.module=void 0,r.global.exports=void 0,r.__exec(e),r.global.define=i,r.get("@@global-helpers").retrieveGlobal(o.id,n,e.metadata.init)}),a.call(r,e)}}function cjs(e){function t(e){a.lastIndex=0,r.lastIndex=0;for(var t,o=[],e=e.replace(n,"");t=r.exec(e);)o.push(t[2]||t[3]);return o}var a=/(?:^\s*|[}{\(\);,\n=:\?\&]\s*|module\.)(exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=)/,r=/(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g,n=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,o=e.instantiate;e.instantiate=function(n){return n.metadata.format||(a.lastIndex=0,r.lastIndex=0,(r.exec(n.source)||a.exec(n.source))&&(n.metadata.format="cjs")),"cjs"==n.metadata.format&&(n.metadata.deps=n.metadata.deps?n.metadata.deps.concat(t(n.source)):n.metadata.deps,n.metadata.executingRequire=!0,n.metadata.execute=function(t,a,r){var o=(n.address||"").split("/");o.pop(),o=o.join("/"),e.global._g={global:e.global,exports:a,module:r,require:t,__filename:n.address,__dirname:o};var i="(function(global, exports, module, require, __filename, __dirname) { "+n.source+"\n}).call(_g.exports, _g.global, _g.exports, _g.module, _g.require, _g.__filename, _g.__dirname);",l=e.global.define;e.global.define=void 0,e.__exec({name:n.name,address:n.address,source:i}),e.global.define=l,e.global._g=void 0}),o.call(this,n)}}function amd(loader){function getCJSDeps(e,t){e=e.replace(commentRegEx,"");var a=e.match(fnBracketRegEx),r=(a[1].split(",")[t]||"require").replace(wsRegEx,""),n=requireRegExs[r]||(requireRegExs[r]=new RegExp(cjsRequirePre+r+cjsRequirePost,"g"));n.lastIndex=0;for(var o,i=[];o=n.exec(e);)i.push(o[2]||o[3]);return i}function require(e,t,a,r){var n=this;if("object"==typeof e&&!(e instanceof Array))return require.apply(null,Array.prototype.splice.call(arguments,1,arguments.length-1));if(!(e instanceof Array)){if("string"==typeof e){var o=n.get(e);return o.__useDefault?o["default"]:o}throw"Invalid require"}Promise.all(e.map(function(e){return n["import"](e,r)})).then(function(e){t.apply(null,e)},a)}function makeRequire(e,t,a){return function(r,n,o){return"string"==typeof r?t(r):require.call(a,r,n,o,{name:e})}}function generateDefine(e){function t(t,a,r){"string"!=typeof t&&(r=a,a=t,t=null),a instanceof Array||(r=a,a=["require","exports","module"]),"function"!=typeof r&&(r=function(e){return function(){return e}}(r)),void 0===a[a.length-1]&&a.pop();var n,o,i;if(-1!=(n=indexOf.call(a,"require"))){a.splice(n,1);var l=r.toString();a=a.concat(getCJSDeps(l,n))}-1!=(o=indexOf.call(a,"exports"))&&a.splice(o,1),-1!=(i=indexOf.call(a,"module"))&&a.splice(i,1);var s={deps:a,execute:function(t,l,s){for(var d=[],u=0;u<a.length;u++)d.push(t(a[u]));s.uri=e.baseURL+s.id,s.config=function(){},-1!=i&&d.splice(i,0,s),-1!=o&&d.splice(o,0,l),-1!=n&&d.splice(n,0,makeRequire(s.id,t,e));var c=r.apply(global,d);return"undefined"==typeof c&&s&&(c=s.exports),"undefined"!=typeof c?c:void 0}};if(t)anonDefine=0!=a.length||anonDefine||defineBundle?null:s,defineBundle=!0,e.register(t,s.deps,!1,s.execute);else{if(anonDefine)throw"Multiple defines for anonymous module";anonDefine=s}}var a=e.onScriptLoad;e.onScriptLoad=function(e){a(e),(anonDefine||defineBundle)&&(e.metadata.format="defined"),anonDefine&&(e.metadata.deps=e.metadata.deps?e.metadata.deps.concat(anonDefine.deps):anonDefine.deps,e.metadata.execute=anonDefine.execute)},t.amd={},e.amdDefine=t}function createDefine(e){e.amdDefine||generateDefine(e),anonDefine=null,defineBundle=null;var t=e.global;oldModule=t.module,oldExports=t.exports,oldDefine=t.define,t.module=void 0,t.exports=void 0,t.define&&t.define===e.amdDefine||(t.define=e.amdDefine)}function removeDefine(e){var t=e.global;t.define=oldDefine,t.module=oldModule,t.exports=oldExports}var isNode="undefined"!=typeof module&&module.exports,amdRegEx=/(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/,commentRegEx=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,cjsRequirePre="(?:^\\s*|[}{\\(\\);,\\n=:\\?\\&]\\s*)",cjsRequirePost="\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)",fnBracketRegEx=/\(([^\)]*)\)/,wsRegEx=/^\s+|\s+$/g,requireRegExs={};loader.amdRequire=require;var anonDefine,defineBundle,oldModule,oldExports,oldDefine;if(generateDefine(loader),loader.scriptLoader){var loaderFetch=loader.fetch;loader.fetch=function(e){return createDefine(this),loaderFetch.call(this,e)}}var loaderInstantiate=loader.instantiate;loader.instantiate=function(load){var loader=this;if("amd"==load.metadata.format||!load.metadata.format&&load.source.match(amdRegEx)){load.metadata.format="amd",createDefine(loader);try{loader.__exec(load)}catch(e){if(loader.execute!==!1||!isNode)throw e;var match=load.source.match(amdRegEx);match&&(match[1]&&"["==match[1][0]?define(match[1].substr(match[1].length-2),eval(match[2]),function(){}):match[2]&&"["==match[2][0]?define(eval(match[2]),function(){}):define(function(){}))}if(removeDefine(loader),!anonDefine&&!defineBundle&&!isNode)throw"AMD module "+load.name+" did not define";anonDefine&&(load.metadata.deps=load.metadata.deps?load.metadata.deps.concat(anonDefine.deps):anonDefine.deps,load.metadata.execute=anonDefine.execute)}return loaderInstantiate.call(loader,load)}}function map(e){function t(e,t){return e.length<t.length?!1:e.substr(0,t.length)!=t?!1:e[t.length]&&"/"!=e[t.length]?!1:!0}function a(e){for(var t=1,a=0,r=e.length;r>a;a++)"/"===e[a]&&t++;return t}function r(e,t,a){return a+e.substr(t)}function n(e,n,o){var i,l,s,d,u=0,c=0;if(n)for(var f in o.map){var m=o.map[f];if("object"==typeof m&&t(n,f)&&(s=a(f),!(c>=s)))for(var p in m)t(e,p)&&(d=a(p),u>=d||(i=p,u=d,l=f,c=s))}if(i)return r(e,i.length,o.map[l][i]);for(var f in o.map){var m=o.map[f];if("string"==typeof m&&t(e,f)){var d=a(f);u>=d||(i=f,u=d)}}return i?r(e,i.length,o.map[i]):e}e.map=e.map||{};var o=e.normalize;e.normalize=function(e,t,a){var r=this;r.map||(r.map={});var i=!1;return"/"==e.substr(e.length-1,1)&&(i=!0,e+="#"),Promise.resolve(o.call(r,e,t,a)).then(function(e){if(e=n(e,t,r),i){var a=e.split("/");a.pop();var o=a.pop();a.push(o),a.push(o),e=a.join("/")}return e})}}function plugins(e){"undefined"==typeof indexOf&&(indexOf=Array.prototype.indexOf);var t=e.normalize;e.normalize=function(e,a,r){var n,o=this;return a&&-1!=(n=a.indexOf("!"))&&(a=a.substr(0,n)),Promise.resolve(t.call(o,e,a,r)).then(function(e){var t=e.lastIndexOf("!");if(-1!=t){var n=e.substr(0,t),i=e.substr(t+1)||n.substr(n.lastIndexOf(".")+1);return new Promise(function(e){e(o.normalize(i,a,r))}).then(function(e){return i=e,o.normalize(n,a,r)}).then(function(e){return e+"!"+i})}return e})};var a=e.locate;e.locate=function(e){var t=this,r=e.name,n=r.lastIndexOf("!");if(-1!=n){var o=r.substr(n+1);e.name=r.substr(0,n);var i=t.pluginLoader||t;return i["import"](o).then(function(){var a=i.get(o);return a=a["default"]||a,a.build===!1&&t.pluginLoader&&(e.metadata.build=!1),e.metadata.plugin=a,e.metadata.pluginName=o,e.metadata.pluginArgument=e.name,a.locate?a.locate.call(t,e):Promise.resolve(t.locate(e)).then(function(e){return e.substr(0,e.length-3)})})}return a.call(this,e)};var r=e.fetch;e.fetch=function(e){var t=this;return e.metadata.build===!1?"":e.metadata.plugin&&e.metadata.plugin.fetch&&!e.metadata.pluginFetchCalled?(e.metadata.pluginFetchCalled=!0,e.metadata.plugin.fetch.call(t,e,r)):r.call(t,e)};var n=e.translate;e.translate=function(e){var t=this;return e.metadata.plugin&&e.metadata.plugin.translate?Promise.resolve(e.metadata.plugin.translate.call(t,e)).then(function(a){return a&&(e.source=a),n.call(t,e)}):n.call(t,e)};var o=e.instantiate;e.instantiate=function(e){var t=this;return e.metadata.plugin&&e.metadata.plugin.instantiate?Promise.resolve(e.metadata.plugin.instantiate.call(t,e)).then(function(a){return e.metadata.format="defined",e.metadata.execute=function(){return a},o.call(t,e)}):e.metadata.plugin&&e.metadata.plugin.build===!1?(e.metadata.format="defined",e.metadata.deps.push(e.metadata.pluginName),e.metadata.execute=function(){return t.newModule({})},o.call(t,e)):o.call(t,e)}}function bundles(e){"undefined"==typeof indexOf&&(indexOf=Array.prototype.indexOf),e.bundles=e.bundles||{};var t=e.fetch;e.fetch=function(e){var a=this;if(a.trace)return t.call(this,e);a.bundles||(a.bundles={});for(var r in a.bundles)if(-1!=indexOf.call(a.bundles[r],e.name))return Promise.resolve(a.normalize(r)).then(function(e){return a.bundles[e]=a.bundles[e]||a.bundles[r],a.meta=a.meta||{},a.meta[e]=a.meta[e]||{},a.meta[e].bundle=!0,a.load(e)}).then(function(){return""});return t.call(this,e)}}function versions(e){"undefined"==typeof indexOf&&(indexOf=Array.prototype.indexOf);var t=/^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?)?)?$/,a=function(e,t){var a,r=e.split("."),n=t.split(".");r[2]&&-1!=(a=indexOf.call(r[2],"-"))&&r.splice(2,1,r[2].substr(0,a),r[2].substr(a+1)),n[2]&&-1!=(a=indexOf.call(n[2],"-"))&&n.splice(2,1,n[2].substr(0,a),n[2].substr(a+1));for(var o=0;o<Math.max(r.length,n.length);o++){if(!r[o])return 1;if(!n[o])return-1;if(r[o]!=n[o])return parseInt(r[o])>parseInt(n[o])?1:-1}return 0};e.versions=e.versions||{};var r=e.normalize;e.normalize=function(n,o,i){e.versions||(e.versions={});var l,s,d=this.versions;if(n.indexOf("@")>0){var u=n.lastIndexOf("@"),c=n.substr(u+1,n.length-u-1).split("/");l=c[0],s=c.length,n=n.substr(0,u)+n.substr(u+l.length+1,n.length-u-l.length-1)}return Promise.resolve(r.call(this,n,o,i)).then(function(e){var r,n,o,i,u=e.indexOf("@");if(l&&(-1==u||0==u)){var c=e.split("/");c[c.length-s]+="@"+l,e=c.join("/"),u=e.indexOf("@")}if(-1==u||0==u){for(var f in d)if(i=d[f],e.substr(0,f.length)==f&&(o=e.substr(f.length,1),!o||"/"==o))return f+"@"+("string"==typeof i?i:i[i.length-1])+e.substr(f.length);return e}r=e.substr(u+1).split("/")[0];var m,p=r.length;if("^"==r.substr(0,1)&&(r=r.substr(1),m=!0),n=r.match(t),!n)return e;m&&(n[2]||(m=!1),n[3]||(n[2]>0?n[3]="0":m=!1)),m&&(n[1]>0?(n[2]||(r=n[1]+".0.0"),n[3]||(r=n[1]+".0"),m=r,n=[n[1]]):n[2]>0?(m=r,n=[0,n[2]]):(m=!1,n=[0,0,n[3]]),r=n.join("."));var h=e.substr(0,u);if(i=d[h]||[],"string"==typeof i&&(i=[i]),!n[3]||m)for(var g=i.length-1;g>=0;g--){var v=i[g];if(v.substr(0,r.length)==r&&v.substr(r.length,1).match(/^[\.\-]?$/)&&(!m||m&&-1!=a(v,m)))return h+"@"+v+e.substr(h.length+p+1)}return-1==indexOf.call(i,r)&&(i.push(r),i.sort(a),e=h+"@"+r+e.substr(h.length+p+1),n[3]&&-1!=(u=indexOf.call(i,n[1]+"."+n[2]))&&i.splice(u,1),n[2]&&-1!=(u=indexOf.call(i,n[1]))&&i.splice(u,1),d[h]=1==i.length?i[0]:i),e})}}function depCache(e){e.depCache=e.depCache||{},loaderLocate=e.locate,e.locate=function(e){var t=this;t.depCache||(t.depCache={});var a=t.depCache[e.name];if(a)for(var r=0;r<a.length;r++)t.load(a[r]);return loaderLocate.call(t,e)}}$__global.upgradeSystemLoader=void 0;var indexOf=Array.prototype.indexOf||function(e){for(var t=0,a=this.length;a>t;t++)if(this[t]===e)return t;return-1},System;!function(){var e=$__global.System;System=$__global.System=new LoaderPolyfill(e),System.baseURL=e.baseURL,System.paths={"*":"*.js"},System.originalSystem=e}(),System.noConflict=function(){$__global.SystemJS=System,$__global.System=System.originalSystem},meta(System),register(System),core(System),global(System),cjs(System),amd(System),map(System),plugins(System),bundles(System),versions(System),depCache(System),System.paths["@traceur"]||(System.paths["@traceur"]=$__curScript&&$__curScript.getAttribute("data-traceur-src")||($__curScript&&$__curScript.src?$__curScript.src.substr(0,$__curScript.src.lastIndexOf("/")+1):System.baseURL+(System.baseURL.lastIndexOf("/")==System.baseURL.length-1?"":"/"))+'traceur@0.0.58.js')};var $__curScript,__eval;!function(){var doEval;__eval=function(e,t,a){e+="\n//# sourceURL="+t+(a?"\n//# sourceMappingURL="+a:"");try{doEval(e)}catch(r){throw"Error evaluating "+t}};var isWorker="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope,isBrowser="undefined"!=typeof window;if(isBrowser){var head,scripts=document.getElementsByTagName("script");if($__curScript=scripts[scripts.length-1],doEval=function(e){head||(head=document.head||document.body||document.documentElement);var t=document.createElement("script");t.text=e;var a,r=window.onerror;if(window.onerror=function(e){a=e},head.appendChild(t),head.removeChild(t),window.onerror=r,a)throw a},$__global.System&&$__global.LoaderPolyfill)$__global.upgradeSystemLoader();else{var curPath=$__curScript.src,basePath=curPath.substr(0,curPath.lastIndexOf("/")+1);document.write('<script type="text/javascript" src="'+basePath+'es6-module-loader@0.8.js" data-init="upgradeSystemLoader">'+"<"+"/script>")}}else if(isWorker)if(doEval=function(source){try{eval(source)}catch(e){throw e}},$__global.System&&$__global.LoaderPolyfill)$__global.upgradeSystemLoader();else{var basePath="";try{throw new Error("Getting the path")}catch(err){var idx=err.stack.indexOf("at ")+3,withSystem=err.stack.substr(idx,err.stack.substr(idx).indexOf("\n"));basePath=withSystem.substr(0,withSystem.lastIndexOf("/")+1)}importScripts(basePath+"es6-module-loader.js")}else{var es6ModuleLoader=require("es6-module-loader");$__global.System=es6ModuleLoader.System,$__global.Loader=es6ModuleLoader.Loader,$__global.upgradeSystemLoader(),module.exports=$__global.System;var vm=require("vm");doEval=function(e){vm.runInThisContext(e)}}}()}("undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope?self:global);