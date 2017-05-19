// # add-item component

/*
The add button to append an item to a field.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

export default React.createClass({

  displayName: 'AddItem',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function () {
    return {
      label: '[add]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    const tabIndex = this.props.readOnly ? null : 0;

    const onKeyDown = (event) => {
      if (event.keyCode === 13) {
        this.props.onClick(event);
      }
    };

    return (
      <span
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        className={cx(this.props.classes)}
        onClick={this.props.onClick}>
        {this.props.label}
      </span>
    );
  }
});
