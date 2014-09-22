'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.default = '';

  plugin.getValidProps = function (originalProps) {
    var props = {};
    if (originalProps.choices) {
      props.choices = originalProps.choices;
      if (!_.isArray(props.choices)) {
        if (_.isObject(props.choices)) {
          props.choices = Object.keys(props.choices).map(function (key) {
            return {
              key: key,
              value: props.choices[key]
            };
          });
        } else if (_.isString(props.choices)) {
          return props.choices.split(',').map(function (key) {
            return {
              key: key,
              value: key
            };
          });
        }
      }
      props.choices = props.choices.map(function (choice) {
        if (_.isString(choice)) {
          return {
            key: choice,
            value: choice
          };
        }
        return choice;
      });
    }
    return props;
  };
};
