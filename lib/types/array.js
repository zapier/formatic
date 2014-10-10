'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.default = [];

  plugin.fields = function (field) {

    if (_.isArray(field.value)) {
      return field.value.map(function (value, i) {
        var item = field.itemForValue(value);
        item.key = i;
        return field.createChild(item);
      });
    } else {
      return [];
    }
  };
};
