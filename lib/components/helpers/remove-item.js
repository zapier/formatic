// # component.remove-item

/*
Remove an item.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'RemoveItem',

  getDefaultProps: function () {
    return {
      label: '[remove]'
    };
  },

  render: function () {
    return R.span({className: cx(this.props.classes), onClick: this.props.onClick}, this.props.label);
  }
});
