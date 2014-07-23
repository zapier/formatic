'use strict';

module.exports = function (formatic) {

  formatic.form.wrap('evalField', function (next, field) {

    field.errors = {};

    return next();
  });
};
