'use strict';

module.exports = function (formatic, config) {

  formatic.type(config.type, {

    hasFields: true,

    compileField: function (field, compile) {

      field.fields = compile(field.fields);

      return field;
    }
  });
};
