/* */ 
"format cjs";exports.readFileSync=function(e){var t,r=new XMLHttpRequest;return r.open("GET",e,!1),r.onreadystatechange=function(){if(4==r.readyState){var n=r.status;if(n>399&&600>n||400==n)throw"File read error on "+e;t=r.responseText}},r.send(null),t};
//# sourceMappingURL=fs.js.map