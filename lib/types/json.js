'use strict';

module.exports = {

  compile: function (field) {

    field.value = field.value || '';

    return field;
  },

  format: function (value) {
    return JSON.stringify(value);
  },

  parse: function (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }
};
