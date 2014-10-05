'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.wrap('modifyField', function (next, field) {

    if (field.choices) {

      var choices = field.choices;

      if (_.isString(choices)) {
        choices = choices.split(',');
      }

      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function (key) {
          return {
            value: key,
            label: choices[key]
          };
        });
      }

      choices.forEach(function (choice, i) {
        if (_.isString(choice)) {
          choices[i] = {
            value: choice,
            label: choice
          };
        }
      });

      field.choices = choices;
    }

    return next();
  });
};
