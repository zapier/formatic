// # helper mixin

/*
This gets mixed into all helper components.
*/

'use strict';

import shared from './shared';

export default {
  ...shared,

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function() {
    return this.props.config.renderComponent(this);
  },

  hasReadOnlyControls: function() {
    return this.props.config.fieldHasReadOnlyControls(this.props.field);
  },
};
