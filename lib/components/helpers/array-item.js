// # component.list-item

/*
Render a list item.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ArrayItem',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.className)},
      config.createElement('array-item-value', {field: field, index: this.props.index,
        onChange: this.props.onChange, onAction: this.onBubbleAction}),
      config.createElement('array-item-control', {field: field, index: this.props.index, numItems: this.props.numItems,
        onMove: this.props.onMove, onRemove: this.props.onRemove})
    );
  }
});
