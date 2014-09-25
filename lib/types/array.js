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
    var children = field.children();
    children.forEach(function (child, i) {
      child.val(value[i]);
    });
    if (children.count() < value.length) {
      for (var i = children.count(); i < value.length; i++) {
        var fieldDef = formatic.fieldDefFromValue(value[i]);
        field.append(fieldDef);
      }
    }
  };

  plugin.fieldProps = ['items'];
};
