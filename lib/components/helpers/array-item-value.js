// # array-item-value component

/*
Render the value of an array item.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'ArrayItemValue',

  mixins: [HelperMixin],

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
