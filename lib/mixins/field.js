// # field mixin

/*
This mixin gets mixed into all field components.
*/

'use strict';

import _ from '../undash';

export default {

  // Signal a change in value.
  onChangeValue: function (value) {
    this.props.onChange(value, {
      field: this.props.field
    });
  },

  // Bubble up a value.
  onBubbleValue: function (value, info) {
    this.props.onChange(value, info);
  },

  // Start an action bubbling up through parent components.
  onStartAction: function (action, props) {
    if (this.props.onAction) {
      const info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  onFocusAction: function () {
    this.onStartAction('focus');
  },

  onBlurAction: function () {
    this.onStartAction('blur');
  },

  // Bubble up an action.
  onBubbleAction: function (info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function () {
    return this.props.config.renderFieldComponent(this);
  },

  isReadOnly: function () {
    return this.props.config.fieldIsReadOnly(this.props.field);
  }
};
