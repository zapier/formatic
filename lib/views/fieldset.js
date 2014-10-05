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

      return formatic.view('field')({
        field: field
      },
        R.fieldset({className: this.props.className},
          this.props.fields.map(function (field) {
            return this.props.form.component(field, {key: field.id});
          }.bind(this))
        )
      );
    }
  });
};
