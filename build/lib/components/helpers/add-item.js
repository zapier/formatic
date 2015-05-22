// # add-item component

/*
The add button to append an item to a field.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'AddItem',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[add]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});