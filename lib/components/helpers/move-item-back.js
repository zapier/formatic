// # move-item-back component

/*
Button to move an item backwards in list.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

module.exports = React.createClass({

  displayName: 'MoveItemBack',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function () {
    return {
      label: '[up]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <span className={cx(this.props.classes)} onClick={this.props.onClick}>
        {this.props.label}
      </span>
    );
  }
});
