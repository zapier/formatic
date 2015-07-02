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

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return this.props.config.createElement('pretty-text-helper', {
      classes: this.props.classes,
      tabIndex: this.props.field.tabIndex,
      onChange: this.props.onChange,
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      value: this.props.getDisplayValue(),
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      onTagClick: this.onTagClick,
      ref: 'textBox',
      isEditable: this.props.isEnteringCustomValue
    });

    if (this.props.isEnteringCustomValue) {
      return <input className={cx(_.extend({}, this.props.classes))} type="text" value={this.props.field.value}
                    onChange={this.props.onChange} onFocus={this.props.onFocus} onBlur={this.props.onBlur} />;
    }

    return <input type="text" value={this.props.getDisplayValue()} readOnly onFocus={this.props.onFocus} onBlur={this.props.onBlur} />;
  },

});
