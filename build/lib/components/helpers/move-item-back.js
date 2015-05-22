// # move-item-back component

/*
Button to move an item backwards in list.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'MoveItemBack',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[up]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});