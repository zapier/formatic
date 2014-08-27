'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.compileField = function (field) {

    field = formatic.type('select').compileField(field);

    if (field.type === 'field') {
      field = field.fields[0];
    }

    if (!_.isArray(field.value)) {
      if (!field.value) {
        field.value = [];
      } else {
        field.value = [field.value];
      }
    }

    if (field.choices.length === 0) {
      field.value = (typeof field.value === 'boolean') ? field.value : (field.value[0] ? field.value[0] : false);
      field.type = 'boolean-checkbox';
    }

    return field;
  };
};
