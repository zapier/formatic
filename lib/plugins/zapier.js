'use strict';

var _ = require('underscore');

var Formatic = require('../formatic');

module.exports = function (formatic) {

  formatic.config({
    typeMap: {
      'unicode': 'text',
      'str': 'text',
      'text': 'textarea'
    }
  });

  formatic.plugin(Formatic.plugins.react);

  formatic.replaceHook('splitKey', function (key) {
    return key.split('__');
  });
};
