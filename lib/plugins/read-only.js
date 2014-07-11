'use strict';

module.exports = function (formatic) {

  formatic.form.use('compileField', function (next, field) {

    if (!field.key) {
      field.isReadOnly = true;
    }
    
    return next();
  });
};
