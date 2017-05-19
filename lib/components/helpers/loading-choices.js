'use strict';

import React from 'react';

export default React.createClass({

  displayName: 'LoadingChoices',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div>Loading choices...</div>
    );
  }

});
