// # component.field

/*
Used by any fields to put the label and help text around the field.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: 'Field',

  mixins: [require('../../mixins/helper')],

  getInitialState: function () {
    return {
      collapsed: this.props.field.collapsed ? true : false
    };
  },

  isCollapsible: function () {
    var field = this.props.field;

    return !_.isUndefined(field.collapsed) || !_.isUndefined(field.collapsible);
  },

  onClickLabel: function () {
    this.setState({
      collapsed: !this.state.collapsed
    });
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;

    if (this.props.plain) {
      return this.props.children;
    }

    var field = this.props.field;

    var index = this.props.index;
    if (!_.isNumber(index)) {
      index = _.isNumber(field.key) ? field.key : undefined;
    }

    return R.div({className: cx(this.props.classes), style: {display: (field.hidden ? 'none' : '')}},
      config.createElement('label', {config: config, field: field, index: index, onClick: this.isCollapsible() ? this.onClickLabel : null}),
      CSSTransitionGroup({transitionName: 'reveal'},
        this.state.collapsed ? [] : [
          config.createElement('help', {config: config, key: 'help', field: field}),
          this.props.children
        ]
      )
    );
  }
});
