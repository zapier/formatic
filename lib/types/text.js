'use strict';

module.exports = function (formatic, typeName) {

  formatic.type(typeName, {

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
