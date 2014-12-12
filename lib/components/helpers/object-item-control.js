// # component.object-item-control

/*
Render the remove buttons for an object item.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ObjectItemControl',

  onRemove: function () {
    this.props.onRemove(this.props.itemKey);
  },

  render: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.classes)},
      config.createElement('remove-item', {field: field, onClick: this.onRemove})
    );
  }
});
