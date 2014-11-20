// # component.object-item

/*
Render an object item.
*/

'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onChangeKey: function (newKey) {
      this.props.onMove(this.props.field.def.key, newKey);
    },

    render: function () {
      var field = this.props.field;

      return R.div({className: this.props.className},
        plugin.component('object-item-key')({form: this.props.form, field: field, onChange: this.onChangeKey, tempKey: this.props.tempKey}),
        plugin.component('object-item-value')({form: this.props.form, field: field}),
        plugin.component('object-item-control')({field: field, numItems: this.props.numItems, onRemove: this.props.onRemove})
      );
    }
  });
};
