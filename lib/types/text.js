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
};
