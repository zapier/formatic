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

  plugin.setValue = function (field, values) {
    var children = field.children().toArray();

    var identities = children.map(function (child) {
      var identity = {};
      if (child.id()) {
        identity.id = child.id();
        identity.key = child.key();
      }
      return identity;
    });

    field.get('fields').clear();

    values.forEach(function (value, i) {
      var fieldDef = field.fieldDefFromValue(value);
      if (identities[i]) {
        _.extend(fieldDef, identities[i]);
      }
      fieldDef._value = value;
      field.append(fieldDef);
    });

    field.children().forEach(function (child, i) {
      //console.log(child._cursor.deref().toJS());
      //child.val(values[i]);
      //console.log(child._cursor.deref().toJS());
    });

    // if (children.count() < values.length) {
    //   for (var i = children.count(); i < values.length; i++) {
    //     var fieldDef = formatic.fieldDefFromValue(values[i]);
    //     field.append(fieldDef);
    //   }
    // }
  };
};
