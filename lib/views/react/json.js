'use strict';

var React = require('react');
var R = React.DOM;

var Field = require('./field');

module.exports = React.createClass({

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
      this.props.onChange(event.target.value);
    }

    this.setState({
      isValid: isValid,
      value: event.target.value
    });
  },

  render: function () {

    var field = this.props.field;

    return Field({field: field},
      R.textarea({
        rows: 5,
        name: field.key,
        value: this.state.value,
        onChange: this.onChange,
        onFocus: this.props.action('focus'),
        style: {backgroundColor: this.state.isValid ? '' : 'rgb(255,200,200)'}
      })
    );
  }
});
