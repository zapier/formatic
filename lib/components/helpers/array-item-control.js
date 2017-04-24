// # array-item-control component

/*
Render the remove and move buttons for an array field.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

module.exports = createReactClass({

  displayName: 'ArrayItemControl',

  mixins: [require('../../mixins/helper')],

  onMoveBack: function () {
    this.props.onMove(this.props.index, this.props.index - 1);
  },

  onMoveForward: function () {
    this.props.onMove(this.props.index, this.props.index + 1);
  },

  onRemove: function () {
    this.props.onRemove(this.props.index);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    const isLastItem = field.fieldIndex === 0 && field.parent.value.length === 1;

    const removeItemControl = config.createElement('remove-item', {
      field: field, onClick: this.onRemove, onMaybeRemove: this.props.onMaybeRemove,
      readOnly: isLastItem && !config.isRemovalOfLastArrayItemAllowed(field)
    });

    const moveItemForward = this.props.index < (this.props.numItems - 1) ?
      config.createElement('move-item-forward', { field: field, onClick: this.onMoveForward }) :
      null;

    const moveItemBack = this.props.index > 0 ?
      config.createElement('move-item-back', { field: field, onClick: this.onMoveBack }) :
      null;

    return (
      <div className={cx(this.props.classes)}>
        {removeItemControl}
        {moveItemBack}
        {moveItemForward}
      </div>
    );
  }
});
