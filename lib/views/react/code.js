'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  var view = React.createClass({

    render: function () {

      var className = 'field code-field';
      if (plugin.config.className) {
        className += ' ' + plugin.config.className;
      }

      return R.pre(_.extend({className: className}, plugin.config.attributes),
        this.props.field.value
      );
    }
  });

  formatic.view(plugin.config.type, view);
};
