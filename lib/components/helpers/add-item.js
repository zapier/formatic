// # component.add-item

/*
The add button to append an item to a field.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'AddItem',

  getDefaultProps: function () {
    return {
      label: '[add]'
    };
  },

  render: function () {
    return R.span({className: cx(this.props.classes), onClick: this.props.onClick}, this.props.label);
  }
});
