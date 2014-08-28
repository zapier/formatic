'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onDelete: function () {
      var parent = this.props.field.parent;
      this.props.onDelete(this.props.field.propertyKey);
      this.props.form.actions.delete(parent, this.props.field.propertyKey);
    },

    onChangeKey: function (event) {
      var parent = this.props.field.parent;
      var newKey = event.target.value;
      var oldKey = this.props.field.propertyKey;
      this.props.onMove(oldKey, newKey);
      this.props.form.actions.move(parent, oldKey, newKey);
    },

    render: function () {
      var field = this.props.field;
      var item = field.field;
      var form = this.props.form;

      var className = plugin.addClass('className', 'object-item');
      var removeClassName = plugin.addClass('removeButton_className', 'object-control-remove');
      var removeLabel = plugin.configValue('removeButton_label', '[remove]');

      var propertyKey = item.propertyKey;

      propertyKey = this.props.form.isTempKey(propertyKey) ? '' : propertyKey;

      return R.div(_.extend({className: className}, plugin.config.attributes),
        R.input({type: 'text', value: propertyKey, onChange: this.onChangeKey}),
        form.component({
          type: 'field',
          field: item
        }),
        R.div({className: removeClassName, onClick: this.onDelete}, removeLabel)
      );
    }
  });
};
