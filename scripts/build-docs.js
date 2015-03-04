'use strict';

require('babel/register');

var fs = require('fs');
var path = require('path');

var RootClass = require('../docs/components/root');

var DOCTYPE = '<!doctype html>';

Object.keys(RootClass.pages).forEach(function (name) {
  var page = RootClass.pages[name];
  var html = DOCTYPE + '\n' + RootClass.renderToString(name);
  fs.writeFileSync(path.join(__dirname, '../live/formatic', page.filename), html);
});
