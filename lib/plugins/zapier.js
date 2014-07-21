'use strict';

var Formatic = require('../formatic');

module.exports = function (formatic) {

  formatic.config({
    typeMap: {
      'unicode': 'text',
      'str': 'text',
      'text': 'textarea',
      'decimal': 'float',
      'int': 'integer',
      'num': 'integer',
      'number': 'integer'
    }
  });

  formatic.plugin(Formatic.plugins.react);

  formatic.replaceMethod('splitKey', function (key) {
    return [key];
    //return key.split('__');
  });
};
