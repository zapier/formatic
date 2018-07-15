/* global __dirname */

require('babel/register');

const fs = require('fs');
const path = require('path');

const RootClass = require('../docs/components/root');

const DOCTYPE = '<!doctype html>';

Object.keys(RootClass.pages).forEach(function (name) {
  const page = RootClass.pages[name];
  const html = DOCTYPE + '\n' + RootClass.renderToString(name);
  fs.writeFileSync(path.join(__dirname, '../live/formatic', page.filename), html);
});
