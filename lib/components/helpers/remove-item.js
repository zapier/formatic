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

  getDefaultProps: function () {
    return {
      label: '[remove]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  onMouseOverRemove: function () {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(true);
    }
  },

  onMouseOutRemove: function () {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(false);
    }
  },

  renderDefault: function () {
    if (this.props.readOnly) {
      const classes = _.extend({}, this.props.classes, {'readonly-control': this.props.readOnly});
      return R.span({ className: cx(classes) }, this.props.label);
    }

    const onKeyDown = (event) => {
      if (event.keyCode === 13) {
        this.props.onClick(event);
      }
    };

    return R.span({
      tabIndex: 0, onKeyDown,
      className: cx(this.props.classes), onClick: this.props.onClick,
      onMouseOver: this.onMouseOverRemove, onMouseOut: this.onMouseOutRemove
    }, this.props.label);
  }
});
