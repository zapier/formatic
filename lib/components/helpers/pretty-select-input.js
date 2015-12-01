// # pretty-select-input component

/*
   Render an input to be used as the element for typing a custom value into a pretty select.
 */

'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'PrettySelectInput',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  focus: function () {
    this.refs.textBox.focus();
  },

  setChoicesOpen: function (isOpenChoices) {
    this.refs.textBox.setChoicesOpen(isOpenChoices);
  },

  renderDefault: function () {
    const tabIndex = this.isReadOnly() ? null : this.props.field.tabIndex;

    return this.props.config.createElement('pretty-text-input', {
      classes: this.props.classes,
      tabIndex: tabIndex,
      onChange: this.props.onChange,
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      onAction: this.onBubbleAction,
      field: this.props.field,
      value: this.props.isEnteringCustomValue ? this.props.field.value : this.props.getDisplayValue(),
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      onTagClick: this.onTagClick,
      ref: 'textBox',
      readOnly: !this.props.isEnteringCustomValue,
      disabled: this.isReadOnly()
    });
  }

});
