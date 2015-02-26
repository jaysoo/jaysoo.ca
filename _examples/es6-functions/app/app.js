// 1. function declaration
function g() {
  console.log(this);
}

// Ways to invoke

g();
g.apply();
g.call();
new g();

// function expression (with assignment)
var g = function() {
};

// immediately invoked function expression
(function() {
}());


// another IIFE
(function g() {
}());

// Arrow function
var g = () => {};
