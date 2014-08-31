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
        field.type + '-field',
        field.errors.required ? 'validation-error-required' : '',
        field.required ? 'required' : 'not-required',
        plugin.config.className,
        field.className
      );

      var props = {
        className: className
      };

      _.extend(props, plugin.config.attributes);

      var label = null;
      if (field.label) {
        label = R.label({}, field.label);
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
          R.div({className: 'field-label'},
            label,
            ' ',
            required
          ),
          this.props.form.component(field)
        );
      }


    }
  });
};
