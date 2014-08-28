'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onAppend: function () {
      this.props.form.actions.insert(this.props.field);
    },

    render: function () {
      var field = this.props.field;
      var form = this.props.form;

      var className = plugin.config.className || '';

      return R.div(_.extend({className: className}, plugin.config.attributes),
        field.fields.map(function (child, i) {
          return form.component({
            type: 'list-item',
            field: child,
            parent: field,
            index: i
          });
        }.bind(this)),
        R.span({className: 'list-control-add', onClick: this.onAppend}, '[add]')
      );
    }
  });
};
