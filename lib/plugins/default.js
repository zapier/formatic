'use strict';

module.exports = function (formatic) {

  formatic.form.wrap('compileField', function (next, field) {

    if (typeof field.default !== 'undefined') {
      if (typeof field.value === 'undefined') {
        field.value = field.default;
      }
    }

    return next();
  });
};
