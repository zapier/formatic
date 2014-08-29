'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onAppend: function () {
      var field = this.props.field;
      var item = null;
      if (this.refs.typeSelect) {
        var index = parseInt(this.refs.typeSelect.getDOMNode().value);
        item = field.itemTypes[index].item;
      }
      this.props.form.actions.insert(this.props.field, null, item);
    },

    render: function () {
      var field = this.props.field;
      var form = this.props.form;

      var className = plugin.addClass('className');
      var addClassName = plugin.addClass('addButton_className', 'list-control-add');
      var addLabel = plugin.configValue('addButton_label', '[add]');

      var numItems = field.fields.length;

      var typeChoices = null;
      if (field.itemTypes) {
        typeChoices = R.select({ref: 'typeSelect'},
          field.itemTypes.map(function (item, i) {
            return R.option({value: i}, item.label);
          })
        );
      }

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
        typeChoices,
        R.span({className: addClassName, onClick: this.onAppend}, addLabel)
      );
    }
  });
};
