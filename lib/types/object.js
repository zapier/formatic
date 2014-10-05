'use strict';

var _ = require('underscore');
var Immutable = require('immutable');

module.exports = function (formatic, plugin) {

  plugin.default = {};

  plugin.hasFields = true;

  plugin.getFieldValue = function (field) {
    var obj = {};
    field.fields.forEach(function (child) {
      if (child.key) {
        obj[child.key] = formatic.getFieldValue(child);
      }
    });
    return obj;
  };

  plugin.setFieldValue = function (fieldState, value, templateMap) {

    return fieldState.withMutations(function (field) {

      var unusedKeys = Object.keys(value);

      field.get('fields').forEach(function (child, i) {
        if (child.has('key')) {
          unusedKeys = _.without(unusedKeys, child.get('key'));
          if (typeof value[child.get('key')] !== 'undefined') {
            field.updateIn(['fields', i], function () {
              return formatic.setFieldValue(child, value[child.get('key')], templateMap);
            });
          }
        }
      });

      var items = field.get('items');

      if (unusedKeys.length > 0) {
        unusedKeys.forEach(function (key) {

          var childDef = formatic.fieldDefFromValue(value[key], items, templateMap);
          childDef.key = key;
          childDef.id = formatic.newId(field, childDef);
          childDef.label = formatic.humanize(key);
          field.updateIn(['fields'], function (fields) {
            var childState = formatic.fromJS(childDef);
            childState = formatic.setFieldValue(childState, value[key], templateMap);
            return fields.push(childState);
          });
        });
      }
    });
  };
};
