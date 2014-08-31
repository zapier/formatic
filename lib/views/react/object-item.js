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
      var parent = this.props.field.parent;
      var field = this.props.field;
      var item = field.field;
      var form = this.props.form;

      var className = formatic.className('object-item', plugin.config.className, field.className);
      var removeClassName = formatic.className('object-control-remove', plugin.config.removeButton_className, field.removeButton_className);
      var removeLabel = plugin.configValue('removeButton_label', '[remove]');

      var propertyKey = item.propertyKey;

      propertyKey = this.props.form.isTempKey(propertyKey) ? '' : propertyKey;

      var keyInput;
      if (parent.keyChoices) {
        var keyChoices = parent.keyChoices.slice(0);
        if (propertyKey === '') {
          keyChoices = [''].concat(keyChoices);
        }
        if (keyChoices.indexOf(propertyKey) < 0) {
          keyChoices = keyChoices.concat([propertyKey]);
        }
        keyInput = R.select({value: propertyKey, onChange: this.onChangeKey},
          keyChoices.map(function (choice) {
            return R.option({}, choice);
          })
        );

      } else {
        keyInput = R.input({type: 'text', value: propertyKey, onChange: this.onChangeKey});
      }

      return R.div(_.extend({className: className}, plugin.config.attributes),
        parent.itemKeyLabel ? R.span({}, parent.itemKeyLabel) : null,
        keyInput,
        form.component({
          type: 'field',
          field: item
        }),
        R.div({className: removeClassName, onClick: this.onDelete}, removeLabel)
      );
    }
  });
};
