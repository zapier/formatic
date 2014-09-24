'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onChange: function (event) {
      var newValue = event.target.value;
      this.props.field.val(newValue);
    },

    render: function () {

      return formatic.view('field')({
        field: this.props.field
      }, R.textarea({
        value: this.props.field.val(),
        rows: this.props.rows,
        onChange: this.onChange
      }));
    }
  });
};
