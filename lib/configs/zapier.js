'use strict';

var _ = require('underscore');

var core = require('../core');

var typeMap = {
  text: 'unicode'
};

var fixType = function (key) {
  if (key in typeMap) {
    key = typeMap[key];
  }
  return key;
};

module.exports = function (formatic) {

  formatic.viewer(require('../viewers/react'));

  _.each(core.views.react, function (view, key) {
    key = fixType(key);
    formatic.view(key, view);
  });

  formatic.plugin(core.plugins.type);

  _.each(core.types, function (type, key) {
    key = fixType(key);
    formatic.type(key, type);
  });

};
