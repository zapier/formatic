'use strict';

var _ = require('underscore');

module.exports = function (f, plugin) {

  plugin.default = {};

  plugin.fields = function (field) {

    var fields = [];
    var value = field.value;
    var unusedKeys = _.keys(value);

    if (field.def.fields) {

      fields = field.def.fields.map(function (def) {
        var child = field.createChild(def);
        if (!f.isBlank(child.def.key)) {
          unusedKeys = _.without(unusedKeys, child.def.key);
        }
        return child;
      });
    }

    if (unusedKeys.length > 0) {
      unusedKeys.forEach(function (key) {
        var item = field.itemForValue(value[key]);
        item.key = key;
        fields.push(field.createChild(item));
      });
    }

    return fields;
  };

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
              if (!item.get('label')) {
                item = item.set('label', formatic.humanize(key));
              }
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
