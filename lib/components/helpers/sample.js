// # help component

/*
Just the help text block.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'Sample',

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    const choice = this.props.choice;

    return !choice.sample ? null : (
      <div className={cx(this.props.className)}>
        {choice.sample}
      </div>
    );
  }
});
