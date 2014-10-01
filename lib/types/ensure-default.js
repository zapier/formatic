'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.wrap('modifyField', function (next, field) {

    var typePlugin = formatic.type(field.type);

    if (typeof field.default === 'undefined') {
      if (typeof typePlugin.default !== 'undefined') {
        field.default = typePlugin.default;
      } else {
        field.default = null;
      }
    }

    return next();
  });
};
