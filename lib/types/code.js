'use strict';

module.exports = function (formatic, plugin) {

  formatic.type(plugin.config.type, {

    compileField: function (field) {

      field.value = field.value || '';

      return field;
    }
  });
};
