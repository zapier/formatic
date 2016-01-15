// # assoc-item component

/*
Render an object item.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'AssocListItem',

  mixins: [require('../../mixins/helper')],

  onChangeKey: function (newKey) {
    this.props.onChangeKey(this.props.index, newKey);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.classes)},
      config.createElement('assoc-list-item-key', {field: field, onChange: this.onChangeKey, onAction: this.onBubbleAction, displayKey: this.props.displayKey, isDuplicateKey: this.props.isDuplicateKey}),
      config.createElement('assoc-list-item-value', {field: field, onChange: this.props.onChange, onAction: this.onBubbleAction, index: this.props.index}),
      config.createElement('assoc-list-item-control', {field: field, onRemove: this.props.onRemove, index: this.props.index})
    );
  }
});
