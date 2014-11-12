// # component.field

/*
Used by any fields to put the label and help text around the field.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    getInitialState: function () {
      return {
        collapsed: this.props.field.def.collapsed ? true : false
      };
    },

    isCollapsible: function () {
      var field = this.props.field;

      return !_.isUndefined(field.def.collapsed) || !_.isUndefined(field.def.collapsible);
    },

    onClickLabel: function () {
      this.setState({
        collapsed: !this.state.collapsed
      });
    },

    render: function () {

      var field = this.props.field;

      var index = this.props.index;
      if (!_.isNumber(index)) {
        index = _.isNumber(field.def.key) ? field.def.key : undefined;
      }

      return R.div({className: this.props.className, style: {display: (field.hidden() ? 'none' : '')}},
        plugin.component('label')({field: field, index: index, onClick: this.isCollapsible() ? this.onClickLabel : null}),
        React.addons.CSSTransitionGroup({transitionName: 'reveal'},
          this.state.collapsed ? [] : [
            plugin.component('help')({key: 'help', field: field}),
            this.props.children
          ]
        )
      );
    }
  });
};
