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
  }
};
