// # array-item-value component

/*
Render the value of an array item.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

module.exports = React.createClass({

  displayName: 'ArrayItemValue',

  mixins: [require('../../mixins/helper')],

  onChangeField: function (newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return (
      <div className={cx(this.props.classes)}>
        {config.createFieldElement({field: field, onChange: this.onChangeField, onAction: this.onBubbleAction})}
      </div>
    );
  }
});
