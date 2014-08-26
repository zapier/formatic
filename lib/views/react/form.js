'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  var view = React.createClass({
    render: function () {

      var className = 'formatic';

      if (plugin.config.className) {
        className += ' ' + plugin.config.className;
      }

      return R.form(_.extend({className: className}, plugin.config.attributes),
        this.props.field.fields.map(function (field) {
          return this.props.form.component(field);
        }.bind(this))
      );
    }
  });

  formatic.view(plugin.config.type, view);
};
