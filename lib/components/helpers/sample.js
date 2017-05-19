// # help component

/*
Just the help text block.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'Sample',

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var choice = this.props.choice;

    return !choice.sample ? null : (
      <div className={cx(this.props.className)}>
        {choice.sample}
      </div>
    );
  }
});
