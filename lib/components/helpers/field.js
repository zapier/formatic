// # field component

/*
Used by any fields to put the label and help text around the field.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var _ = require('../../undash');
var cx = require('classnames');

module.exports = createReactClass({

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

    var errors = config.fieldErrors(field);

    errors.forEach(function (error) {
      classes['validation-error-' + error.type] = true;
    });

    if (config.fieldIsRequired(field)) {
      classes.required = true;
    } else {
      classes.optional = true;
    }

    if (this.isReadOnly()) {
      classes.readonly = true;
    }

    const label = config.createElement('label', {
      config: config,
      field: field,
      index: index,
      onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
    });

    const help = config.cssTransitionWrapper(
      this.state.collapsed ? [] : [
        config.createElement('help', {
          config: config, field: field,
          key: 'help'
        }),
        this.props.children
      ]
    );

    return (
      <div
        className={cx(classes)}
        style={{ display: (field.hidden ? 'none' : '') }}>
        {label}
        {help}
      </div>
    );
  }
});
