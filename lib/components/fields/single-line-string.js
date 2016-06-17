// # single-line-string component

/*
Render a single line text input.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'SingleLineString',

  mixins: [require('../../mixins/field')],

  onChange: function (event) {
    this.onChangeValue(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    const readOnly = config.fieldIsReadOnly(field);
    const tabIndex = readOnly ? -1 : (this.props.tabIndex || 0);

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, R.input({
      tabIndex,
      type: 'text',
      value: this.props.field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      autoComplete: field.autoComplete,
      autoFocus: field.autoFocus,
      placeholder: field.placeholder,
      readOnly
    }));
  }
});
