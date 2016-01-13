// # assoc-item-control component

/*
Render the remove buttons for an object item.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'AssocListItemControl',

  mixins: [require('../../mixins/helper')],

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

    return R.div({className: cx(this.props.classes)},
      config.createElement('remove-item', {
        field: field,
        onClick: this.onRemove,
        readOnly: isLastItem && !config.isRemovalOfLastAssocListItemAllowed(field)
      })
    );
  }
});
