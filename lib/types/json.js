'use strict';

module.exports = function (formatic, plugin) {

  plugin.compileField = function (field) {

    if (field.isWrapped) {
      return field;
    }

    field.value = field.value || '';

    return {
      type: 'field',
      fields: [field],
      isWrapped: true
    };
  };

  plugin.formatField = function (value) {
    return JSON.stringify(value, null, 2);
  };

  plugin.parseField = function (value) {
    return JSON.parse(value);
  };
};
