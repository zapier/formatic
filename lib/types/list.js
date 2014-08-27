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

    field.value = field.value || [];

    return field;
  };

  plugin.evalField = function (field, data, run) {

    var array = formatic.getObject(data, field.key);

    // Evaluation causing side effect. Bad??? Alternative???
    if (!array) {
      if (field.value && _.isArray(field.value)) {
        array = field.value;
        field.value = undefined;
        formatic.setObject(data, field.key, array);
      }
    }

    if (array) {
      field.fields = [];

      _.each(array, function (value, i) {

        var child = run(field.item, i);

        field.fields.push(child);
      });
    }

    return field;
  };

  plugin.isArray = true;
};
