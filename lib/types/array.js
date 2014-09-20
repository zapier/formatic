'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.default = [];

  plugin.getValue = function (field) {
    var array = [];
    field.each(function (child) {
      array.push(child.val());
    });
    return array;
  };

  plugin.setValue = function (field, value) {
    field.each(function (child) {
      if (child.hasKey()) {
        child.val(value[child.key()]);
      }
    });
  };

  plugin.fieldProps = ['items'];
};
