'use strict';

var _ = require('underscore');

module.exports = function (formatic, config) {

  formatic.form.wrap('compile', function (next, field) {

    if (typeof field === 'undefined') {
      field = {
        type: config.type,
        fields: []
      };
    } else if (_.isArray(field)) {
      field = {
        type: config.type,
        fields: field
      };
    } else if (field.type !== config.type) {
      field = {
        type: config.type,
        fields: [field]
      };
    }

    return next(field);
  });

  formatic.type(config.type, {

    hasFields: true,

    compileField: function (field, compile) {

      field.fields = compile(field.fields);

      return field;
    }
  });
};
