'use strict';

module.exports = {

  compile: function (field) {

    field.value = field.value || '';

    return field;
  }
};
