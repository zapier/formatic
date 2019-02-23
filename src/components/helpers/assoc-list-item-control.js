// # assoc-item-control component

/*
Render the remove buttons for an object item.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'AssocListItemControl',

  mixins: [HelperMixin],

  onRemove: function() {
    this.props.onRemove(this.props.index);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const isLastItem =
      field.fieldIndex === 0 && Object.keys(field.parent.value).length === 1;

    const removeItem = config.createElement('remove-item', {
      field,
      onClick: this.onRemove,
      readOnly:
        isLastItem && !config.isRemovalOfLastAssocListItemAllowed(field),
    });

    return (
      <div
        className={cx(this.props.classes)}
        renderWith={this.renderWith('ListItemControl')}
      >
        {removeItem}
      </div>
    );
  },
});
