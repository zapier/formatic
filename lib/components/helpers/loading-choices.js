'use strict';

import React from 'react';

import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'LoadingChoices',

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div>Loading choices...</div>
    );
  }

});
