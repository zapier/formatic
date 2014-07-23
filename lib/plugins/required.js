'use strict';

module.exports = function (formatic) {

  formatic.form.wrap('evalField', function (next, field) {

    if (field.required) {
      if (typeof field.value === 'undefined' || field.value === '') {
        field.errors.required = true;
      }
    }

    return next();
  });
};
