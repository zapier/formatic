'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.form.use('compile', function (next, field) {

    if (typeof field === 'undefined') {
      field = {
        type: 'form',
        fields: []
      };
    } else if (_.isArray(field)) {
      field = {
        type: 'form',
        fields: field
      };
    } else if (field.type !== 'form') {
      field = {
        type: 'form',
        fields: [field]
      };
    }

    return next(field);
  });

  return {

    hasFields: true,

    compile: function (field, compile) {

      field.fields = compile(field.fields);

      return field;
    }
  };
};
