// # component.root

/*
Root component just used to spit out all the fields for a form.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;

module.exports = function (plugin) {

  var util = plugin.require('util');

  plugin.exports = React.createClass({

    getDefaultProps: function () {
      return {
        className: util.className('root', plugin.config.className)
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
