// # component.move-item-back

/*
Button to move an item backwards in list.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'MoveItemBack',

  getDefaultProps: function () {
    return {
      label: '[up]'
    };
  },

  render: function () {
    return R.span({className: cx(this.props.classes), onClick: this.props.onClick}, this.props.label);
  }
});
