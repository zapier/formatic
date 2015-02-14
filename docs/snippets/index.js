'use strict';

var fs = require('fs');
var path = require('path');

module.exports = {
  'npm-install': fs.readFileSync(path.join(__dirname, './npm-install.txt'), 'utf8'),
  'use-commonjs': fs.readFileSync(path.join(__dirname, './use-commonjs.txt'), 'utf8'),
  'bower-install': fs.readFileSync(path.join(__dirname, './bower-install.txt'), 'utf8'),
  'use-global': fs.readFileSync(path.join(__dirname, './use-global.txt'), 'utf8'),

  'string-field': fs.readFileSync(path.join(__dirname, './string-field.txt'), 'utf8'),
  'single-line-string-field': fs.readFileSync(path.join(__dirname, './single-line-string-field.txt'), 'utf8'),
  'select-field': fs.readFileSync(path.join(__dirname, './select-field.txt'), 'utf8'),
  'boolean-field': fs.readFileSync(path.join(__dirname, './boolean-field.txt'), 'utf8'),
  'checkbox-boolean-field': fs.readFileSync(path.join(__dirname, './checkbox-boolean-field.txt'), 'utf8'),
  'pretty-text-field': fs.readFileSync(path.join(__dirname, './pretty-text-field.txt'), 'utf8'),
  'array-field': fs.readFileSync(path.join(__dirname, './array-field.txt'), 'utf8'),
  'checkbox-array-field': fs.readFileSync(path.join(__dirname, './checkbox-array-field.txt'), 'utf8'),
  'object-field': fs.readFileSync(path.join(__dirname, './object-field.txt'), 'utf8')
};
