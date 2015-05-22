// # move-item-forward component

/*
Button to move an item forward in a list.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'MoveItemForward',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[down]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});