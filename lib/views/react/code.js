'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    render: function () {
      var className = formatic.className('field code-field', plugin.config.className, this.props.field.className);

      return R.pre(_.extend({className: className}, plugin.config.attributes),
        this.props.field.value
      );
    }
  });
};
