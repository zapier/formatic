'use strict';

module.exports = function (formatic) {

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
};
