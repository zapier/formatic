'use strict';

module.exports = function (formatic, typeName) {

  formatic.type(typeName, {

    compileField: function (field) {

      field.value = field.value || '';

      return field;
    }
  });
};
