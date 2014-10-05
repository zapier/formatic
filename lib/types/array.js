'use strict';

var _ = require('underscore');
var Immutable = require('immutable');

module.exports = function (formatic, plugin) {

  plugin.default = [];

  plugin.hasFields = true;

  plugin.getFieldValue = function (field) {
    var array = [];

    if (!field.fields || (field.fields.length === 0 && typeof field.value !== 'undefined')) {
      return field.value;
    }

    field.fields.forEach(function (child) {
      array.push(formatic.getFieldValue(child));
    });

    return array;
  };

  plugin.setFieldValue = function (fieldState, values, templateMap) {

    if (!_.isArray(values)) {
      throw new Error('Trying to put non-array value into array field.');
    }

    return fieldState.withMutations(function (field) {

      var children = field.get('fields').toArray();

      var identities = children.map(function (child) {
        var identity = {};
        if (child.get('id')) {
          identity.id = child.get('id');
          identity.key = child.get('key');
        }
        return identity;
      });

      field.set('fields', formatic.fromJS([]));

      var items = field.get('items');

      values.forEach(function (value, i) {
        var childDef = formatic.fieldDefFromValue(value, items, templateMap);
        childDef.key = 'item___' + i;
        childDef.id = formatic.newId(field, childDef);
        if (identities[i]) {
          _.extend(childDef, identities[i]);
        }
        field.updateIn(['fields'], function (fields) {
          var childState = Immutable.fromJS(childDef);
          childState = formatic.setFieldValue(childState, value, templateMap);
          return fields.push(childState);
        });
      });
    });
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
