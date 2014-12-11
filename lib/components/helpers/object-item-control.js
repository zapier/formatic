// # component.object-item-control

/*
Render the remove buttons for an object item.
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

    onRemove: function () {
      this.props.onRemove(this.props.field.def.key);
    },

    render: function () {
      var field = this.props.field;

      return R.div({className: this.props.className},
        plugin.component('remove-item')({field: field, onClick: this.onRemove})
      );
    }
  });
};
