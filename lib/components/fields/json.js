// # json component

/*
Textarea editor for JSON. Will validate the JSON before setting the value, so
while the value is invalid, no external state changes will occur.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'Json',

  mixins: [require('../../mixins/field')],

  getDefaultProps: function () {
    return {
      rows: 5
    };
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
      isValid: true,
      value: JSON.stringify(this.props.field.value, null, 2)
    };
  },

  onChange: function (event) {
    var isValid = this.isValidValue(event.target.value);

    if (isValid) {
      // Need to handle this better. Need to track position.
      this._isChanging = true;
      this.onChangeValue(JSON.parse(event.target.value));
    }

    this.setState({
      isValid: isValid,
      value: event.target.value
    });
  },

  componentWillReceiveProps: function (nextProps) {
    if (!this._isChanging) {
      this.setState({
        isValid: true,
        value: JSON.stringify(nextProps.field.value, null, 2)
      });
    }
    this._isChanging = false;
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      field: config.fieldWithValue(field, this.state.value), plain: this.props.plain
    },
      R.textarea({
        className: cx(this.props.classes),
        value: this.state.value,
        onChange: this.onChange,
        style: {backgroundColor: this.state.isValid ? '' : 'rgb(255,200,200)'},
        rows: config.fieldRows(field) || this.props.rows,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction,
        disabled: this.isReadOnly()
      })
    );
  }
});
