// # array-item component

/*
Render an array item.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';
import _ from '../../undash';

import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'ArrayItem',

  mixins: [HelperMixin],

  getInitialState: function () {
    return {
      isMaybeRemoving: false
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  onMaybeRemove: function (isMaybeRemoving) {
    this.setState({
      isMaybeRemoving: isMaybeRemoving
    });
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    var classes = _.extend({}, this.props.classes);

    if (this.state.isMaybeRemoving) {
      classes['maybe-removing'] = true;
    }

    let arrayItemControl;
    if (!config.fieldIsReadOnly(field)) {
      arrayItemControl = config.createElement('array-item-control', {
        field: field,
        index: this.props.index,
        numItems: this.props.numItems,
        onMove: this.props.onMove,
        onRemove: this.props.onRemove,
        onMaybeRemove: this.onMaybeRemove
      });
    }

    const arrayItemValue = config.createElement('array-item-value', {
      field: field,
      index: this.props.index,
      onChange: this.props.onChange,
      onAction: this.onBubbleAction
    });

    return (
      <div className={cx(classes)}>
        {arrayItemControl}
        {arrayItemValue}
      </div>
    );
  }
});
