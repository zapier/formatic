'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.wrap('modifyField', function (next, field) {

    var typePlugin = formatic.type(field.type);

    if (typeof typePlugin.hasFields) {
      if (!field.fields) {
        field.fields = [];
      }
    }

    return next();
  });
};
