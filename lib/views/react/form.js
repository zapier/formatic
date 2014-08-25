'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, config) {

  config = config || {};

  var className = 'formatic';

  if (config.className) {
    className += ' ' + config.className;
  }

  var view = React.createClass({
    render: function () {
      return R.form(_.extend({className: className}, config.attributes),
        this.props.field.fields.map(function (field) {
          return this.props.form.component(field);
        }.bind(this))
      );
    }
  });

  formatic.view(config.type, view);
};
