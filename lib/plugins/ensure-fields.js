'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.wrap('normalizeField', function (next, fieldState) {

    var typePlugin = formatic.type(fieldState.get('type'));

    if (typePlugin.hasFields) {
      if (!_.isFunction(typePlugin.hasFields) || typePlugin.hasFields(fieldState)) {
        if (!fieldState.get('fields')) {
          fieldState = fieldState.set('fields', formatic.fromJS([]));
        }
      }
    }

    return next(fieldState);
  });
};
