'use strict';

var _ = require('underscore');

module.exports = function (formatic, typeName) {

  formatic.form.wrap('compile', function (next, field) {

    if (typeof field === 'undefined') {
      field = {
        type: typeName,
        fields: []
      };
    } else if (_.isArray(field)) {
      field = {
        type: typeName,
        fields: field
      };
    } else if (field.type !== typeName) {
      field = {
        type: typeName,
        fields: [field]
      };
    }

    return next(field);
  });

  formatic.type(typeName, {

    hasFields: true,

    compileField: function (field, compile) {

      field.fields = compile(field.fields);

      return field;
    }
  });
};
