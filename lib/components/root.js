'use strict';

var React = require('react/addons');
var R = React.DOM;

module.exports = function (formatic, plugin) {

  plugin.component = React.createClass({

    getDefaultProps: function () {
      return {
        className: formatic.className('root', plugin.config.className)
      };
    },

    render: function () {
      var field = this.props.field;

      return R.div({
        className: this.props.className
      },
        field.fields().map(function (field) {
          return field.component();
        })
      );
    }
  });
};
