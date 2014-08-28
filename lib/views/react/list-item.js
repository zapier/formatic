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

      var className = 'list-item';

      if (plugin.config.className) {
        className += ' ' + plugin.config.className;
      }

      return R.div(_.extend({className: className}, plugin.config.attributes),
        form.component({
          type: 'field',
          field: item
        }),
        R.div({className: 'list-control-remove', onClick: this.onDelete}, '[remove]'),
        R.div({className: 'list-control-up', onClick: this.onMoveUp}, '[up]'),
        R.div({className: 'list-control-down', onClick: this.onMoveDown}, '[down]')
      );
    }
  });
};
