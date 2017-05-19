'use strict';

import React from 'react';

export default React.createClass({

  displayName: 'LoadingChoice',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <span>Loading choices...</span>
    );
  }

});
