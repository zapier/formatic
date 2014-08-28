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

      var className = plugin.addClass('className');
      var addClassName = plugin.addClass('addButton_className', 'list-control-add');
      var addLabel = plugin.configValue('addButton_label', '[add]');
      
      var numItems = field.fields.length;

      return R.div(_.extend({className: className}, plugin.config.attributes),
        field.fields.map(function (child, i) {
          return form.component({
            type: 'list-item',
            field: child,
            parent: field,
            index: i,
            numItems: numItems
          });
        }.bind(this)),
        R.span({className: addClassName, onClick: this.onAppend}, addLabel)
      );
    }
  });
};
