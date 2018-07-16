'use strict';

import React from 'react';
import createReactClass from 'create-react-class';

import HelperMixin from '../../mixins/helper';

export default createReactClass({
  displayName: 'LoadingChoices',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return <div>Loading choices...</div>;
  },
});
