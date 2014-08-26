'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  var view = React.createClass({

    render: function () {

      var field = this.props.field.fields[0];

      var classes = [
        'field',
        field.type + '-field'
      ];

      if (field.errors.required) {
        classes.push('validation-error-required');
      }

      if (field.required) {
        classes.push('required');
      } else {
        classes.push('not-required');
      }

      if (plugin.config.className) {
        classes.push(plugin.config.className);
      }

      var props = {
        className: classes.join(' ')
      };

      _.extend(props, plugin.config.attributes);

      var label = R.label({}, field.label);

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

  formatic.view(plugin.config.type, view);
};
