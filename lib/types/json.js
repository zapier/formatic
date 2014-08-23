'use strict';

module.exports = function (formatic, config) {

  formatic.type(config.type, {

    compileField: function (field) {

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

    formatField: function (value) {
      return JSON.stringify(value);
    },

    parseField: function (value) {
      return JSON.parse(value);
    }
  });
};
