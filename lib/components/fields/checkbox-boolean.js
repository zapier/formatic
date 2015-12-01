// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'CheckboxBoolean',

  mixins: [require('../../mixins/field')],

  onChange: function (event) {
    this.onChangeValue(event.target.checked);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: true
    },
    R.span({style: {whiteSpace: 'nowrap'}},
      R.input({
        type: 'checkbox',
        checked: field.value,
        className: cx(this.props.classes),
        onChange: this.onChange,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction,
        disabled: this.isReadOnly()
      }),
      R.span({}, ' '),
      R.span({}, config.fieldHelpText(field) || config.fieldLabel(field))
    ));
  }
});
