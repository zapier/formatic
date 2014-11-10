// # type.array

/*
Support array type where child fields are dynamically determined based on the
values of the array.
*/

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  plugin.exports.default = [];

  plugin.exports.fields = function (field) {

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
