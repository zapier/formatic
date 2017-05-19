// # ChoiceSectionHeader component

/*
Render section header in choices dropdown
*/

'use strict';

import React from 'react';
import cx from 'classnames';

export default React.createClass({

  displayName: 'ChoiceSectionHeader',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var choice = this.props.choice;
    return <span className={cx(this.props.classes)}>{choice.label}</span>;
  }
});
