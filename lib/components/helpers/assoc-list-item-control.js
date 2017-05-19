// # assoc-item-control component

/*
Render the remove buttons for an object item.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'AssocListItemControl',

  mixins: [HelperMixin],

  onRemove: function () {
    this.props.onRemove(this.props.index);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    const isLastItem = field.fieldIndex === 0 && Object.keys(field.parent.value).length === 1;

    const removeItem = config.createElement('remove-item', {
      field: field,
      onClick: this.onRemove,
      readOnly: isLastItem && !config.isRemovalOfLastAssocListItemAllowed(field)
    });

    return (
      <div className={cx(this.props.classes)}>
        {removeItem}
      </div>
    );
  }
});
