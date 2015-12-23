// # remove-item component

/*
Remove an item.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');
var _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'RemoveItem',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[remove]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onMouseOverRemove: function onMouseOverRemove() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(true);
    }
  },

  onMouseOutRemove: function onMouseOutRemove() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(false);
    }
  },

  renderDefault: function renderDefault() {
    if (this.props.readOnly) {
      var classes = _.extend({}, this.props.classes, { 'readonly-control': this.props.readOnly });
      return R.span({ className: cx(classes) }, this.props.label);
    }

    return R.span({
      className: cx(this.props.classes), onClick: this.props.onClick,
      onMouseOver: this.onMouseOverRemove, onMouseOut: this.onMouseOutRemove
    }, this.props.label);
  }
});