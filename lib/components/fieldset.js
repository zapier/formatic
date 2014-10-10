'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.component = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {
      var field = this.props.field;

      return formatic.component('field')({
        field: field
      },
        R.fieldset({className: this.props.className},
          field.fields().map(function (field) {
            return field.component();
          }.bind(this))
        )
      );
    }
  });
};
