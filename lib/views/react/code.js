'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, config) {

  config = config || {};

  var className = 'field code-field';
  if (config.className) {
    className += ' ' + config.className;
  }

  var view = React.createClass({

    render: function () {
      return R.pre(_.extend({className: className}, config.attributes),
        this.props.field.value
      );
    }
  });

  formatic.view(config.type, view);
};
