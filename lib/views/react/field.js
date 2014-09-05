'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    isCollapsableProps: function (props) {
      if (props.field.collapsable === true || props.field.field.collapsable === true) {
        return true;
      }
      if (typeof props.field.collapsed === 'boolean' || typeof props.field.field.collapsed === 'boolean') {
        return true;
      }
      return false;
    },

    isCollapsedProps: function (props) {
      if (this.state && !props.onClickLabel) {
        return this.state.collapsed;
      }
      if (typeof props.field.collapsed === 'boolean') {
        return props.field.collapsed;
      }
      if (typeof props.field.field.collapsed === 'boolean') {
        return props.field.field.collapsed;
      }
      if (props.field.collapsable === true) {
        if (this.state.collapsed === false) {
          return false;
        }
        return true;
      }
      return false;
    },

    getInitialState: function () {
      return {
        collapsable: this.isCollapsableProps(this.props),
        collapsed: this.isCollapsedProps(this.props)
      };
    },

    componentWillReceiveProps: function (props) {
      this.setState({
        collapsable: this.isCollapsableProps(props),
        collapsed: this.isCollapsedProps(props)
      });
    },

    onClickLabel: function () {
      this.setState({
        collapsed: !this.state.collapsed
      });
    },

    render: function () {

      var field = this.props.field.field;

      var className = formatic.className(
        'field',
        field.type + '-field',
        field.errors.required ? 'validation-error-required' : '',
        field.required ? 'required' : 'not-required',
        plugin.config.className,
        field.className
      );

      var helpClassName = formatic.className('field-help', plugin.config.help_className);

      var props = {
        className: className
      };

      _.extend(props, plugin.config.attributes);

      var label = null;
      if (typeof this.props.field.index === 'number') {
        label = '' + (this.props.field.index + 1) + '.';
        if (field.label) {
          label = label + ' ' + field.label;
        }
      }

      if (field.label || label) {
        var text = label || field.label;
        if (this.state.collapsable) {
          text = R.a({href: 'JavaScript' + ':', onClick: this.props.onClickLabel || this.onClickLabel}, text);
        }
        label = R.label({}, text);
      }

      var required = R.span({className: 'required-text'});

      // Oddball for now, should configure for more of these.
      if (field.type === 'boolean-checkbox') {
        return R.div(props,
          this.props.form.component(field),
          label,
          ' ',
          required
        );
      } else {
        return R.div(props,
          R.div({
            className: 'field-label'
          },
            label,
            ' ',
            required
          ),
          React.addons.CSSTransitionGroup({transitionName: 'reveal'},
            this.state.collapsed ? [] : [
              field.help_text ? R.div({
                key: 'help',
                className: helpClassName
              },
                field.help_text
              ) : R.span({key: 'help'}),
              this.props.form.component(field, {key: 'component'})
            ]
          )
        );
      }


    }
  });
};
