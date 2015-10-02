// # array-item component

/*
Render an array item.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');
var _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'ArrayItem',

  mixins: [require('../../mixins/helper')],

  getInitialState: function getInitialState() {
    return {
      isMaybeRemoving: false
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onMaybeRemove: function onMaybeRemove(isMaybeRemoving) {
    this.setState({
      isMaybeRemoving: isMaybeRemoving
    });
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var classes = _.extend({}, this.props.classes);

    if (this.state.isMaybeRemoving) {
      classes['maybe-removing'] = true;
    }

    var arrayItemControl = undefined;
    if (!config.fieldIsReadOnly(field)) {
      arrayItemControl = config.createElement('array-item-control', { field: field, index: this.props.index, numItems: this.props.numItems,
        onMove: this.props.onMove, onRemove: this.props.onRemove, onMaybeRemove: this.onMaybeRemove });
    }

    return R.div({ className: cx(classes) }, config.createElement('array-item-value', { field: field, index: this.props.index,
      onChange: this.props.onChange, onAction: this.onBubbleAction }), arrayItemControl);
  }
});