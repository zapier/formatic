'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.wrap('normalizeField', function (next, fieldState) {

    var typePlugin = formatic.type(fieldState.get('type'));

    if (!fieldState.has('default')) {
      if (typeof typePlugin.default !== 'undefined') {
        fieldState = fieldState.set('default', formatic.fromJS(typePlugin.default));
      } else {
        fieldState = fieldState.set('default', null);
      }
    }

    if (!fieldState.has('value')) {
      fieldState = fieldState.set('value', fieldState.get('default'));
    }

    return next(fieldState);
  });
  //
  // formatic.wrap('modifyField', function (next, field) {
  //
  //   var typePlugin = formatic.type(field.type);
  //
  //   if (typeof field.default === 'undefined') {
  //     if (typeof typePlugin.default !== 'undefined') {
  //       field.default = typePlugin.default;
  //     } else {
  //       field.default = null;
  //     }
  //   }
  //
  //   if (typeof field.value === 'undefined') {
  //     field.value = field.default;
  //   }
  //
  //   return next();
  // });
};
