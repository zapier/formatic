// # component.list-item

/*
Render a list item.
*/

'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {
      var field = this.props.field;

      return R.div({className: this.props.className},
        plugin.component('list-item-value')({form: this.props.form, field: field, index: this.props.index}),
        plugin.component('list-item-control')({field: field, index: this.props.index, numItems: this.props.numItems, onMove: this.props.onMove, onRemove: this.props.onRemove})
      );
    }
  });
};
