// # field component

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
      collapsed: this.props.config.fieldIsCollapsed(this.props.field) ? true : false
    };
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
      var key = this.props.field.key;
      index = _.isNumber(key) ? key : undefined;
    }

    var classes = _.extend({}, this.props.classes);

    if (config.fieldIsRequired(field)) {
      classes.required = true;

      if (_.isUndefined(this.props.field.value) || this.props.field.value === '') {
        classes['validation-error-required'] = true;
      }

    } else {
      classes.optional = true;
    }

    return R.div({className: cx(classes), style: {display: (field.hidden ? 'none' : '')}},
      config.createElement('label', {
        config: config, field: field,
        index: index, onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
      }),
      CSSTransitionGroup({transitionName: 'reveal'},
        this.state.collapsed ? [] : [
          config.createElement('help', {
            config: config, field: field,
            key: 'help'
          }),
          this.props.children
        ]
      )
    );
  }
});
