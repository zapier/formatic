'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    onDelete: function () {
      var parent = this.props.field.parent;
      this.props.form.actions.delete(parent, this.props.field.index);
    },

    onMoveUp: function () {
      var parent = this.props.field.parent;
      this.props.form.actions.move(parent, this.props.field.index, this.props.field.index - 1);
    },

    onMoveDown: function () {
      var parent = this.props.field.parent;
      this.props.form.actions.move(parent, this.props.field.index, this.props.field.index + 1);
    },

    render: function () {
      var field = this.props.field;
      var item = field.field;
      var form = this.props.form;

      var className = plugin.addClass('className', 'list-item');
      var removeClassName = plugin.addClass('removeButton_className', 'list-control-remove');
      var upClassName = plugin.addClass('upButton_className', 'list-control-up');
      var downClassName = plugin.addClass('downButton_className', 'list-control-down');
      var removeLabel = plugin.configValue('removeButton_label', '[remove]');
      var upLabel = plugin.configValue('upButton_label', '[up]');
      var downLabel = plugin.configValue('downButton_label', '[down]');

      return R.div(_.extend({className: className}, plugin.config.attributes),
        form.component({
          type: 'field',
          field: item
        }),
        R.span({className: removeClassName, onClick: this.onDelete}, removeLabel),
        this.props.field.index > 0 ? R.span({className: upClassName, onClick: this.onMoveUp}, upLabel) : null,
        this.props.field.index < (this.props.field.numItems - 1) ? R.span({className: downClassName, onClick: this.onMoveDown}, downLabel) : null
      );
    }
  });
};
