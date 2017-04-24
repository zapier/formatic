// # move-item-back component

/*
Button to move an item backwards in list.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

module.exports = createReactClass({

  displayName: 'MoveItemBack',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function () {
    return {
      label: '[up]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <span className={cx(this.props.classes)} onClick={this.props.onClick}>
        {this.props.label}
      </span>
    );
  }
});
