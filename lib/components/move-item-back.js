// # component.move-item-back

/*
Button to move an item backwards in list.
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
        label: plugin.configValue('label', '[up]')
      };
    },

    render: function () {
      return R.span({className: this.props.className, onClick: this.props.onClick}, this.props.label);
    }
  });
};
