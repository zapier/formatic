'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    render: function () {
      //var className = formatic.className('formatic', plugin.config.className, this.props.field.className);
      return R.div({className: 'formatic'},
        this.props.children
      );
    }
  });
};
