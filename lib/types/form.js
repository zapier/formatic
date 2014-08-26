'use strict';

module.exports = function (formatic, plugin) {

  formatic.type(plugin.config.type, {

    hasFields: true,

    compileField: function (field, compile) {

      field.fields = compile(field.fields);

      return field;
    }
  });
};
