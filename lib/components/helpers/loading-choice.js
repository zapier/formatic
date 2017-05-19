'use strict';

import React from 'react';

import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'LoadingChoice',

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <span>Loading choices...</span>
    );
  }

});
