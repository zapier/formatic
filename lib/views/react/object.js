'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onAppend: function () {
      var tempKey = this.props.form.tempKey(this.props.field);
      this.props.form.actions.insert(this.props.field, tempKey);
    },

    render: function () {
      var field = this.props.field;
      var form = this.props.form;

      var className = plugin.config.className || '';

      return R.div(_.extend({className: className}, plugin.config.attributes),
        field.fields.map(function (child, i) {
          return form.component({
            type: 'object-item',
            field: child,
            parent: field,
            index: i,
            propertyKey: child.propertyKey
          });
        }.bind(this)),
        R.span({className: 'object-control-add', onClick: this.onAppend}, '[add]')
      );
    }
  });
};
