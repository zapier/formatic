'use strict';

var _ = require('underscore');

var Formatic = require('../formatic');

var typeMap = {
  text: 'unicode',
  textarea: 'text'
};

var fixType = function (key) {
  if (key in typeMap) {
    key = typeMap[key];
  }
  return key;
};

module.exports = function (formatic) {

  formatic.plugin(Formatic.plugins.core);
  formatic.plugin(Formatic.plugins.terse);
  formatic.plugin(Formatic.plugins.reactViewer);

  _.each(Formatic.views.react, function (view, key) {
    key = fixType(key);
    formatic.view(key, view);
  });

  _.each(Formatic.types, function (type, key) {
    key = fixType(key);
    formatic.type(key, type);
  });

  formatic.replaceHook('splitKey', function (key) {
    return key.split('__');
  });
};
