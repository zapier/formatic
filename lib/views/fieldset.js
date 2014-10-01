'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    render: function () {
      return R.fieldset({},
        this.props.fields.map(function (field) {
          return this.props.form.component(field, {key: field.id});
        }.bind(this))
      );
    }
  });
};
