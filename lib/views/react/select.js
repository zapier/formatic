'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    mixins: [require('./mixins/input-actions')],

    render: function () {

      var className = formatic.className(plugin.config.className, this.props.field.className);

      var choices = this.props.field.choices;

      if (!this.props.field.value) {
        choices = [{
          value: '',
          label: ''
        }].concat(choices);
      } else {
        var valueChoice = _.find(choices, function (choice) {
          return choice.value === this.props.field.value;
        }.bind(this));
        if (!valueChoice) {
          choices = choices.concat({
            value: this.props.field.value,
            label: this.props.field.value
          });
        }
      }

      return R.select(_.extend({
        className: className,
        onChange: this.onChange,
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        name: this.props.field.key,
        value: this.props.field.value //,
        //onFocus: this.props.actions.focus
      }, plugin.config.attributes),
        choices.map(function (choice) {
          return R.option({
            value: choice.value
          }, choice.label);
        }.bind(this))
      );
    }
  });
};
