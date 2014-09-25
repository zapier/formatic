'use strict';

var React = require('react/addons');
var R = React.DOM;

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {

      var field = this.props.field;

      return field.get('helpText') ?
        R.div({className: this.props.className},
          field.get('helpText')
        ) :
        R.span(null);
    }
  });
};
