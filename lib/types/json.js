'use strict';

module.exports = function (formatic, plugin) {

  plugin.compileField = function (field) {

    field.value = field.value || '';

    return field;
  };

  plugin.formatField = function (value) {
    return JSON.stringify(value, null, 2);
  };

  plugin.parseField = function (value) {
    return JSON.parse(value);
  };
};
