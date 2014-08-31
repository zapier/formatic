'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onFocus: function () {
      this.props.form.actions.focus(this.props.field);
    },

    onBlur: function () {
      this.props.form.actions.blur(this.props.field);
    },

    isValidValue: function (value) {

      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return false;
      }
    },

    getInitialState: function () {
      return {
        isValid: this.isValidValue(this.props.field.value),
        value: this.props.field.value
      };
    },

    onChange: function (event) {
      var isValid = this.isValidValue(event.target.value);

      if (isValid) {
        this.props.form.actions.change(this.props.field, event.target.value);
      }

      this.setState({
        isValid: isValid,
        value: event.target.value
      });
    },

    render: function () {

      var className = formatic.className(plugin.config.className, this.props.field.className);

      var field = this.props.field;

      return R.textarea(_.extend({
        className: className,
        name: field.key,
        value: this.state.value,
        onChange: this.onChange,
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        style: {backgroundColor: this.state.isValid ? '' : 'rgb(255,200,200)'}
      }, plugin.config.attributes));
    }
  });
};
