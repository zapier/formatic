'use strict';

var _ = require('underscore');
var Immutable = require('immutable');

module.exports = function (formatic, plugin) {

  plugin.default = [];

  plugin.hasFields = function (fieldState) {
    return !fieldState.get('choices');
  };

  plugin.getFieldValue = function (fieldState) {
    if (!fieldState.has('fields')) {
      return formatic.toJS(fieldState.get('value') || plugin.default);
    }

    var array = [];

    fieldState.get('fields').forEach(function (child) {
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

  plugin.evalField = function (form, fieldState, valueState, meta, context, nextContext) {

    if (valueState) {
      var value = valueState.get('value');
      if (value instanceof Immutable.Vector) {

        var fields = Immutable.Vector();
        fields = fields.withMutations(function (fields) {
          value.forEach(function (childValueState, i) {
            var item = formatic.itemForValueState(fieldState, childValueState, context);
            item = item.set('key', i);
            item = item.set('viewKey', childValueState.get('viewKey'));
            fields.push(formatic.evalField(form, item, valueState, meta, nextContext));
          });
        });
        fieldState = fieldState.set('fields', fields);
      }
    }

    return fieldState;
  };
};
