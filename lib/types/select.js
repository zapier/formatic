'use strict';

var _ = require('underscore');

module.exports = function (formatic, config) {

  formatic.type(config.type, {

    compileField: function (field) {

      if (field.isWrapped) {
        return field;
      }

      field.value = field.value || '';

      field.choices = field.choices || [];

      if (!_.isArray(field.choices)) {
        field.choices = Object.keys(field.choices).map(function (key) {
          return {
            value: key,
            label: field.choices[key]
          };
        });
      }

      field.choices = field.choices.map(function (choice) {
        if (typeof choice === 'string') {
          return {value: choice, label: choice};
        }
        if (typeof choice.label === 'undefined') {
          choice.label = choice.value;
        }
        if (typeof choice.value === 'undefined') {
          choice.value = choice.label;
        }
        return choice;
      });

      return {
        type: 'field',
        fields: [field],
        isWrapped: true
      };
    }
  });
};
