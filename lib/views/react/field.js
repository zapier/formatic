'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (formatic, config) {

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

      return R.div({key: field.key, className: classes.join(' ')},
        R.div({className: 'field-label'},
          R.label({},
            field.label
          ),
          ' ',
          R.span({className: 'required-text'})
        ),
        this.props.form.component(field)
      );
    }
  });

  formatic.view(config.type, view);
};
