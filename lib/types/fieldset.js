'use strict';

module.exports = function (formatic, plugin) {

  plugin.hasFields = true;

  plugin.compileField = function (field, compile) {

    field.fields = compile(field.fields);

    return field;
  };
};
