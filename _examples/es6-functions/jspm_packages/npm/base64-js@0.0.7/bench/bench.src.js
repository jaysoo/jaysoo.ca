/* */ 
"format cjs";
var random = require("crypto").pseudoRandomBytes;
var b64 = require("../index");
var fs = require("github:jspm/nodelibs@0.0.3/fs");
var path = require("github:jspm/nodelibs@0.0.3/path");
var data = random(1e6).toString('base64');
var start = Date.now();
var raw = b64.toByteArray(data);
var middle = Date.now();
var data = b64.fromByteArray(raw);
var end = Date.now();
console.log('decode ms, decode ops/ms, encode ms, encode ops/ms');
console.log(middle - start, data.length / (middle - start), end - middle, data.length / (end - middle));
