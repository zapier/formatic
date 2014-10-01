'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {

      var field = this.props.field;

      return R.div({className: this.props.className},
        formatic.view('label')({field: field, index: this.props.index}),
        React.addons.CSSTransitionGroup({transitionName: 'reveal'},
          field.collapsed ? [] : [
            formatic.view('help')({key: 'help', field: field}),
            this.props.children
          ]
        )
      );
    }
  });
};
