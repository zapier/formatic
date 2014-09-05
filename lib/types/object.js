'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.hasFields = true;

  plugin.compileField = function (field, compile) {

    field.item = compile(field.item || {
      type: 'text',
      value: '',
      key: '[]'
    });

    if (field.itemTypes) {
      field.itemTypes = field.itemTypes.map(function (itemType) {
        itemType = _.extend({}, itemType);
        itemType.item = compile(itemType.item);
        return itemType;
      });
    }

    field.value = field.value || {};

    if (field.keyChoices) {
      field.keyChoices = formatic.type('select').buildChoices(field.keyChoices);
    }

    return field;
  };

  plugin.evalField = function (field, data, run) {

    var obj = formatic.getObject(data, field.keyPath);

    // Evaluation causing side effect. Bad??? Alternative???
    if (!_.isObject(obj)) {
      if (field.value && _.isObject(field.value)) {
        obj = field.value;
        field.value = undefined;
        formatic.setObject(data, field.keyPath, obj);
      }
    }

    if (obj) {
      field.fields = [];

      _.each(obj, function (value, key) {

        var item = field.item;

        if (field.itemTypes) {
          var itemType = _.find(field.itemTypes, function (itemType) {
            return key === itemType.type;
          });

          if (itemType) {
            item = itemType.item;
          }
        }

        var child = run(item, key);

        child.propertyKey = key;

        field.fields.push(child);
      });
    }

    return field;
  };

  plugin.isObject = true;
};
