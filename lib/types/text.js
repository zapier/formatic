'use strict';

module.exports = function (formatic, plugin) {

  formatic.type(plugin.config.type, {

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
    }
  });
};
