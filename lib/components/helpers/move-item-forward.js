// # component.move-item-forward

/*
Button to move an item forward in a list.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'MoveItemForward',

  getDefaultProps: function () {
    return {
      label: '[down]'
    };
  },

  render: function () {
    return R.span({className: cx(this.props.classes), onClick: this.props.onClick}, this.props.label);
  }
});
