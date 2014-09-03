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

    field.value = field.value || [];

    return field;
  };

  plugin.evalField = function (field, data, run) {

    var array = formatic.getObject(data, field.keyPath);

    // Evaluation causing side effect. Bad??? Alternative???
    if (!array) {
      if (field.value && _.isArray(field.value)) {
        array = field.value;
        field.value = undefined;
        formatic.setObject(data, field.keyPath, array);
      }
    }

    if (array) {
      field.fields = [];

      _.each(array, function (value, i) {

        //console.log(value);

        var item = field.item;

        if (field.itemTypes) {
          var itemType = _.find(field.itemTypes, function (itemType) {
            return value.type === itemType.type;
          });

          if (itemType) {
            item = itemType.item;
          }
        }

        var child = run(item, i);

        field.fields.push(child);
      });
    }

    return field;
  };

  plugin.isArray = true;
};
