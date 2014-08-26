'use strict';

module.exports = function (formatic, plugin) {

  plugin.compileField = function (field) {

    field.value = field.value || '';

    return field;
  };
};
