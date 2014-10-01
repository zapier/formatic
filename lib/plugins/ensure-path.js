'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.wrap('modifyField', function (next, field, parent, index) {

    if (!parent) {
      field._path = [];
    } else {
      field._path = parent._path.concat(index);
    }

    return next();
  });
};
