'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.buildChoices = function (choices) {

    if (!_.isArray(choices)) {
      choices = Object.keys(choices).map(function (key) {
        return {
          value: key,
          label: choices[key]
        };
      });
    }

    choices = choices.map(function (choice) {
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

    return choices;
  };

  plugin.compileField = function (field) {

    field.choices = field.choices || [];

    field.choices = plugin.buildChoices(field.choices);

    if (typeof field.value === 'boolean') {
      field.isBoolean = true;
      var hasTrue = false;
      var hasFalse = false;
      field.choices = field.choices.map(function (choice) {
        var value = choice.value.toLowerCase();
        if (value === 'true' || value === 'yes') {
          value = 'true';
        } else {
          value = 'false';
        }
        if (value === 'true') {
          hasTrue = true;
        }
        if (value === 'false') {
          hasFalse = true;
        }
        return;
      });

      if (!hasTrue) {
        field.choices = field.choices.concat([
          {
            value: 'true',
            label: 'Yes'
          }
        ]);
      }
      if (!hasFalse) {
        field.choices = field.choices.concat([
          {
            value: 'false',
            label: 'No'
          }
        ]);
      }

    } else {
      field.value = field.value || '';
    }

    return field;
  };

  plugin.formatField = function (field, value) {
    if (field.isBoolean) {
      return value ? 'true' : 'false';
    }
    return value;
  };

  plugin.parseField = function (field, value) {
    if (field.isBoolean) {
      return value === 'true';
    }
    return value;
  };
};
