// # pretty-select-input component

/*
   Render an input to be used as the element for typing a custom value into a pretty select.
 */

'use strict';

var React = require('react/addons');
var _ = require('underscore');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'PrettySelectInput',

  mixins: [require('../../mixins/helper')],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    if (this.props.isEnteringCustomValue) {
      return React.createElement('input', { className: cx(this.props.classes), ref: 'customInput', type: 'text', value: this.props.field.value,
        onChange: this.props.onChange, onFocus: this.props.onFocus, onBlur: this.props.onBlur });
    }

    return React.createElement('input', { type: 'text', value: this.props.getDisplayValue(), readOnly: true, onFocus: this.props.onFocus, onBlur: this.props.onBlur });
  }

});