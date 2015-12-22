// # helper mixin

/*
This gets mixed into all helper components.
*/

'use strict';

var _ = require('../undash');

module.exports = {

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function () {
    return this.props.config.renderComponent(this);
  },

  // Start an action bubbling up through parent components.
  onStartAction: function (action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  // Bubble up an action.
  onBubbleAction: function (info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  onFocusAction: function () {
    this.onStartAction('focus');
  },

  onBlurAction: function () {
    this.onStartAction('blur');
  },

  isReadOnly: function () {
    return this.props.config.fieldIsReadOnly(this.props.field);
  },

  hasReadOnlyControls: function () {
    return this.props.config.fieldHasReadOnlyControls(this.props.field);
  }
};
