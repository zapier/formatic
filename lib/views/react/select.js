'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    mixins: [require('./mixins/input-actions')],

    render: function () {

      var className = plugin.config.className || '';

      var choices = this.props.field.choices;

      if (!this.props.field.value) {
        choices = [{
          value: '',
          label: ''
        }].concat(choices);
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
