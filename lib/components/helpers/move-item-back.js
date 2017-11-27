// # move-item-back component

/*
Button to move an item backwards in list.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'MoveItemBack',

  mixins: [HelperMixin],

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
