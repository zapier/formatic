'use strict';

var _ = require('underscore');
var Immutable = require('immutable');

module.exports = function (formatic, plugin) {

  plugin.default = {};

  plugin.hasFields = true;

  plugin.getFieldValue = function (fieldState) {
    var obj = {};

    // if (!fieldState.has('fields') || (fieldState.get('fields').length === 0 && !fieldState.has('value'))) {
    //   return formatic.toJS(fieldState.get('value'));
    // }

    fieldState.get('fields').forEach(function (child) {
      if (child.get('key')) {
        obj[child.get('key')] = formatic.getFieldValue(child);
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

  // plugin.evalField = function (form, fieldState, valueState, meta, context, nextContext) {
  //
  //   if (valueState) {
  //     var value = valueState.get('value');
  //     if (value instanceof Immutable.Vector) {
  //
  //       var fields = Immutable.Vector();
  //       fields = fields.withMutations(function (fields) {
  //         value.forEach(function (childValueState, i) {
  //           var item = formatic.itemForValueState(fieldState, childValueState, context);
  //           item = item.set('key', i);
  //           item = item.set('viewKey', childValueState.get('viewKey'));
  //           fields.push(formatic.evalField(form, item, valueState, meta, nextContext));
  //         });
  //       });
  //       fieldState = fieldState.set('fields', fields);
  //     }
  //   }
  //
  //   return fieldState;
  // };

  plugin.evalField = function (form, fieldState, valueState, meta, context, nextContext) {

    if (!fieldState.get('fields')) {
      fieldState = fieldState.set('fields', Immutable.Vector([]));
    }

    if (valueState) {
      var value = valueState.get('value');
      if (value instanceof Immutable.Map) {

        var unusedKeys = value.keySeq().toArray();

        fieldState = fieldState.withMutations(function (fieldState) {

          fieldState.get('fields').forEach(function (child, i) {
            child = formatic.resolveField(child, nextContext.parents);
            if (child.has('key')) {
              unusedKeys = _.without(unusedKeys, child.get('key'));
            }
            fieldState.updateIn(['fields', i], function () {
              var newChild = formatic.evalField(form, child, valueState, meta, nextContext);
              if (child.has('key')) {
                newChild = newChild.set('viewKey', child.get('key'));
              } else {
                newChild = newChild.set('viewKey', 'auto_' + i);
              }
              return newChild;
            });
          });

          if (unusedKeys.length > 0) {
            unusedKeys.forEach(function (key) {
              var childValueState = value.get(key);
              var item = formatic.itemForValueState(fieldState, childValueState, context);
              item = item.set('key', key);
              item = item.set('viewKey', childValueState.get('viewKey'));
              fieldState.updateIn(['fields'], function (fields) {
                return fields.push(formatic.evalField(form, item, valueState, meta, nextContext));
              });
            });
          }

        });

        return fieldState;

      }
    }

    // if (fieldState.get('fields')) {
    //   return fieldState.set('fields', fieldState.get('fields').map(function (childState, i) {
    //     childState = formatic.evalField(form, childState, valueState, meta, nextContext);
    //     if (child.has('key')) {
    //       child = child.set('viewKey', child.get('key'));
    //     } else {
    //       child = child.set('viewKey', 'auto_' + i);
    //     }
    //     return childState;
    //   }).toVector());
    // }

    // return fieldState;

  };
};
