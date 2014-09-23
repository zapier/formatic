'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onChange: function (event) {
      this.props.field.val(event.target.value);
    },

    render: function () {

      var field = this.props.field;
      var choices = field.choices();
      var value = field.val();

      if (!value) {
        choices = [{
          value: '',
          label: ''
        }].concat(choices);
      } else {
        var valueChoice = _.find(choices, function (choice) {
          return choice.value === value;
        }.bind(this));
        if (!valueChoice) {
          choices = choices.concat({
            value: value,
            label: value
          });
        }
      }

      return R.select({
        onChange: this.onChange,
        value: value
      },
        choices.map(function (choice) {
          return R.option({
            value: choice.value
          }, choice.label);
        }.bind(this))
      );
    }
  });
};
