'use strict';

var _ = require('underscore');

var Formatic = require('../formatic');

module.exports = function (formatic) {

  formatic.config({
    typeMap: {
      text: 'unicode',
      textarea: 'text'
    }
  });

  formatic.plugin(Formatic.plugins.react);

  formatic.replaceHook('splitKey', function (key) {
    return key.split('__');
  });
};
