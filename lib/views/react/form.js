'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    render: function () {

      var className = formatic.className('formatic', plugin.config.className, this.props.field.className);

      return R.form(_.extend({className: className}, plugin.config.attributes),
        this.props.field.fields.map(function (field) {
          return this.props.form.component({
            type: 'field',
            field: field
          });
        }.bind(this))
      );
    }
  });
};
