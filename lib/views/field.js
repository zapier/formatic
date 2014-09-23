'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    render: function () {

      var field = this.props.field.field;

      var className = formatic.className(
        'field',
        field.type() + '-field'
        //,
        // field.errors.required ? 'validation-error-required' : '',
        // field.required ? 'required' : 'not-required',
        // plugin.config.className,
        // field.className
      );

      //var helpClassName = formatic.className('field-help', plugin.config.help_className);

      var props = {
        className: className
      };

      //_.extend(props, plugin.config.attributes);

      var label = null;
      // if (typeof this.props.field.index === 'number') {
      //   label = '' + (this.props.field.index + 1) + '.';
      //   if (field.label) {
      //     label = label + ' ' + field.label;
      //   }
      // }

      if (field.label() || label) {
        var text = label || field.label;
        if (this.state.collapsable) {
          text = R.a({href: 'JavaScript' + ':', onClick: this.props.onClickLabel || this.onClickLabel}, text);
        }
        label = R.label({}, text);
      }

      var required = R.span({className: 'required-text'});

      var helpText = field.prop('helpText');

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
            helpText ? R.div({
              key: 'help'
            },
              helpText
            ) : R.span({key: 'help'}),
            this.props.children
          ]
        )
      );


    }
  });
};
