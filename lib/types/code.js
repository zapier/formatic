'use strict';

module.exports = function (formatic, config) {

  formatic.type(config.type, {

    compileField: function (field) {

      field.value = field.value || '';

      return field;
    }
  });
};
