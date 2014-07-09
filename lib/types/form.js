'use strict';

var _ = require('underscore');

module.exports = function (formatic, name) {

  formatic.form.use('compile', function (next, field) {

    if (typeof field === 'undefined') {
      field = {
        type: name,
        fields: []
      };
    } else if (_.isArray(field)) {
      field = {
        type: name,
        fields: field
      };
    } else if (field.type !== name) {
      field = {
        type: name,
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
