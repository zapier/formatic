// # field mixin

/*
This mixin gets mixed into all field components.
*/

'use strict';

import shared from './shared';

export default {
  ...shared,

  // Signal a change in value.
  onChangeValue: function(value) {
    this.props.onChange(value, {
      field: this.props.field,
    });
  },

  // Bubble up a value.
  onBubbleValue: function(value, info) {
    this.props.onChange(value, info);
  },

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function() {
    return this.props.config.renderFieldComponent(this);
  },
};
