// # component.help

/*
Just the help text block.
*/

'use strict';

var React = require('react/addons');
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

      return field.def.helpText ?
        R.div({className: this.props.className},
          field.def.helpText
        ) :
        R.span(null);
    }
  });
};
