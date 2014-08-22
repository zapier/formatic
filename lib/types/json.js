'use strict';

module.exports = {

  compile: function (field) {

    if (field.isWrapped) {
      return field;
    }

    field.value = field.value || '';

    return {
      type: 'field',
      fields: [field],
      isWrapped: true
    };
  },

  format: function (value) {
    return JSON.stringify(value);
  },

  parse: function (value) {
    return JSON.parse(value);
  }
};
