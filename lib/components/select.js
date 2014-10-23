'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onChange: function (event) {
      var choiceValue = event.target.value;
      var choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
      if (choiceType === 'choice') {
        var choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
        choiceIndex = parseInt(choiceIndex);
        this.props.field.val(this.props.field.def.choices[choiceIndex].value);
      }
    },

    render: function () {

      var field = this.props.field;
      var choices = field.def.choices || [];

      var value = field.value !== undefined ? field.value : '';

      choices = choices.map(function (choice, i) {
        return {
          choiceValue: 'choice:' + i,
          value: choice.value,
          label: choice.label
        };
      });

      var valueChoice = _.find(choices, function (choice) {
        return choice.value === value;
      });

      if (valueChoice === undefined) {

        var label = value;
        if (!_.isString(value)) {
          label = JSON.stringify(value);
        }
        valueChoice = {
          choiceValue: 'value:',
          value: value,
          label: label
        };
        choices = [valueChoice].concat(choices);
      }

      return plugin.component('field')({
        field: field
      }, R.select({
        className: this.props.className,
        onChange: this.onChange,
        value: valueChoice.choiceValue
      },
        choices.map(function (choice, i) {
          return R.option({
            key: i,
            value: choice.choiceValue
          }, choice.label);
        }.bind(this))
      ));
    }
  });
};
