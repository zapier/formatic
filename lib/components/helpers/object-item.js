// # component.object-item

/*
Render an object item.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ObjectItem',

  mixins: [require('../../mixins/config')],

  onChangeKey: function (newKey) {
    this.props.onMove(this.props.field.def.key, newKey);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.className)},
      config.createElement('object-item-key', {form: this.props.form, field: field, onChange: this.onChangeKey, tempKey: this.props.tempKey}),
      config.createElement('object-item-value', {form: this.props.form, field: field}),
      config.createElement('object-item-control', {field: field, numItems: this.props.numItems, onRemove: this.props.onRemove})
    );
  }
});
