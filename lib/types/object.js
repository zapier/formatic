'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.default = {};

  plugin.getValue = function (field) {
    var obj = {};
    field.each(function (child) {
      if (child.hasKey()) {
        obj[child.key()] = child.val();
      }
    });
    return obj;
  };

  plugin.setValue = function (field, value) {
    var unusedKeys = Object.keys(value);
    field.each(function (child) {
      if (child.hasKey()) {
        unusedKeys = _.without(unusedKeys, child.key());
        child.val(value[child.key()]);
      }
    });
    if (unusedKeys.length > 0) {
      unusedKeys.forEach(function (key) {
        var fieldDef = formatic.fieldDefFromValue(value[key]);
        fieldDef.key = key;
        fieldDef.label = formatic.humanize(key);
        field.append(fieldDef);
      });
    }
  };
};
