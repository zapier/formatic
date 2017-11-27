// # move-item-forward component

/*
Button to move an item forward in a list.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'MoveItemForward',

  mixins: [HelperMixin],

  getDefaultProps: function () {
    return {
      label: '[down]'
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
