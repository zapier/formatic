// # array-item-control component

/*
Render the remove and move buttons for an array field.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'ArrayItemControl',

  mixins: [HelperMixin],

  onMoveBack: function() {
    this.props.onMove(this.props.index, this.props.index - 1);
  },

  onMoveForward: function() {
    this.props.onMove(this.props.index, this.props.index + 1);
  },

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
      field.fieldIndex === 0 && field.parent.value.length === 1;

    const isFirstItem = field.fieldIndex === 0;

    const isLastMoveableItem =
      field.fieldIndex === field.parent.value.length - 1;

    const removeItemControl = config.createElement('remove-item', {
      parentTypeName: this.props.parentTypeName,
      field,
      onClick: this.onRemove,
      onMaybeRemove: this.props.onMaybeRemove,
      readOnly: isLastItem && !config.isRemovalOfLastArrayItemAllowed(field),
    });

    const moveItemForward =
      this.props.index < this.props.numItems - 1
        ? config.createElement('move-item-forward', {
            parentTypeName: this.props.parentTypeName,
            field,
            onClick: this.onMoveForward,
            classes: { 'is-first-item': isFirstItem },
          })
        : null;

    const moveItemBack =
      this.props.index > 0
        ? config.createElement('move-item-back', {
            parentTypeName: this.props.parentTypeName,
            field,
            onClick: this.onMoveBack,
            classes: { 'is-last-item': isLastMoveableItem },
          })
        : null;

    return (
      <div
        className={cx(this.props.classes)}
        renderWith={this.renderWith('ListItemControl')}
      >
        <span renderWith={this.renderWith('ListItemMoveControl')}>
          {moveItemBack}
          {moveItemForward}
        </span>
        {removeItemControl}
      </div>
    );
  },
});
