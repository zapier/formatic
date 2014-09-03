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

        var child = run(field.item, key);

        child.propertyKey = key;

        field.fields.push(child);
      });
    }

    return field;
  };

  plugin.isObject = true;
};
