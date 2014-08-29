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

    return field;
  };

  plugin.evalField = function (field, data, run) {

    var obj = formatic.getObject(data, field.key);

    // Evaluation causing side effect. Bad??? Alternative???
    if (!_.isObject(obj)) {
      if (field.value && _.isObject(field.value)) {
        obj = field.value;
        field.value = undefined;
        formatic.setObject(data, field.key, obj);
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
