'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onChange: function (event) {
      var newValue = event.target.value;
      this.props.field.val(newValue);
    },

    render: function () {

      return R.textarea({
        value: this.props.field.val(),
        rows: this.props.rows,
        onChange: this.onChange
      });
    }
  });
};
