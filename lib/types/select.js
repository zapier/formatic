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

    field.value = field.value || '';

    field.choices = field.choices || [];

    field.choices = plugin.buildChoices(field.choices);

    return field;
  };
};
