// # remove-item component

/*
Remove an item.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

import _ from '../../undash';
import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'RemoveItem',

  mixins: [HelperMixin],

  getDefaultProps: function () {
    return {
      label: '[remove]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  onMouseOverRemove: function () {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(true);
    }
  },

  onMouseOutRemove: function () {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(false);
    }
  },

  renderDefault: function () {
    if (this.props.readOnly) {
      const classes = _.extend({}, this.props.classes, {'readonly-control': this.props.readOnly});

      return (
        <span className={cx(classes)}>
          {this.props.label}
        </span>
      );
    }

    const onKeyDown = (event) => {
      if (event.keyCode === 13) {
        this.props.onClick(event);
      }
    };

    return (
      <span
        tabIndex={0}
        className={cx(this.props.classes)}
        onKeyDown={onKeyDown}
        onClick={this.props.onClick}
        onMouseOver={this.onMouseOverRemove}
        onMouseOut={this.onMouseOutRemove}>
        {this.props.label}
      </span>
    );
  }
});
