// # component.add-item

/*
The add button to append an item to a field.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className,
        label: plugin.configValue('label', '[add]')
      };
    },

    render: function () {
      return R.span({className: this.props.className, onClick: this.props.onClick}, this.props.label);
    }
  });
};
