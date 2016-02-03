// # add-item component

/*
The add button to append an item to a field.
*/

'use strict';

var React = require('react');
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
    var _this = this;

    var tabIndex = this.props.readOnly ? null : 0;

    var onKeyDown = function onKeyDown(event) {
      if (event.keyCode === 13) {
        _this.props.onClick(event);
      }
    };

    return R.span({ tabIndex: tabIndex, onKeyDown: onKeyDown, className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});