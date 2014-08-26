'use strict';

module.exports = function (formatic) {

  formatic.plugin('react');

  formatic.config('core-type.typeMap', {
    'unicode': 'text',
    'str': 'text',
    'text': 'textarea',
    'decimal': 'float',
    'int': 'integer',
    'num': 'integer',
    'number': 'integer',
    'select': 'dropdown',
    'file': 'text',
    'checkbox': 'checkbox-boolean',
    'datetime': 'text'
  });

  formatic.replaceMethod('splitKey', function (key) {
    return [key];
    //return key.split('__');
  });
};
