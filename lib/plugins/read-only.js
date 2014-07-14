'use strict';

module.exports = function (formatic) {

  formatic.form.wrap('compileField', function (next, field) {

    if (!field.key) {
      field.isReadOnly = true;
    }
    
    return next();
  });
};
