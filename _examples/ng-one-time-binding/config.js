System.config({
  "baseUrl": ".",
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "angular": "github:angular/bower-angular@^1.3.0",
    "npm:events": "npm:events@^1.0.2",
    "npm:events@1.0.2": {},
    "npm:Base64@0.2.1": {},
    "npm:inherits@2.0.1": {},
    "npm:ieee754@1.1.4": {},
    "npm:base64-js@0.0.7": {},
    "github:jspm/nodelibs@0.0.3": {
      "Base64": "npm:Base64@0.2",
      "base64-js": "npm:base64-js@0.0",
      "ieee754": "npm:ieee754@^1.1.1",
      "inherits": "npm:inherits@^2.0.1",
      "json": "github:systemjs/plugin-json@master"
    },
    "npm:flux": "npm:flux@^2.0.1",
    "npm:flux@2.0.1": {},
    "npm:lodash": "npm:lodash@^2.4.1",
    "npm:lodash@2.4.1": {}
  }
});

System.config({
  "versions": {
    "github:angular/bower-angular": "1.3.0",
    "npm:events": "1.0.2",
    "github:jspm/nodelibs": "0.0.3",
    "npm:Base64": "0.2.1",
    "npm:base64-js": "0.0.7",
    "npm:inherits": "2.0.1",
    "npm:ieee754": "1.1.4",
    "github:systemjs/plugin-json": "master",
    "npm:flux": "2.0.1",
    "npm:lodash": "2.4.1"
  }
});

