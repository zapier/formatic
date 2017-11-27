// # assoc-item-value component

/*
Render the value of an object item.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'AssocListItemValue',

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

    const fieldElem = config.createFieldElement({
      field: field,
      onChange: this.onChangeField,
      plain: true,
      onAction: this.onBubbleAction
    });

    return (
      <div className={cx(this.props.classes)}>
        {fieldElem}
      </div>
    );
  }
});
