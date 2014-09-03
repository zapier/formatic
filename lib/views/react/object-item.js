'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    getInitialState: function () {
      return {
        useCustomKey: false,
        maybeDelete: false
      };
    },

    onDelete: function () {
      var parent = this.props.field.parent;
      this.props.onDelete(this.props.field.propertyKey);
      this.props.form.actions.delete(parent, this.props.field.propertyKey);
    },

    onChangeKey: function (event) {
      var parent = this.props.field.parent;
      var newKey = event.target.value;
      if (parent.keyChoices && parent.keyChoices.length > 0 && newKey === '--custom--') {
        this.setState({useCustomKey: true});
        return;
      }
      var oldKey = this.props.field.propertyKey;
      this.props.onMove(oldKey, newKey);
      this.props.form.actions.move(parent, oldKey, newKey);
    },

    onMouseOver: function () {
      this.setState({
        maybeDelete: true
      });
    },

    onMouseOut: function () {
      this.setState({
        maybeDelete: false
      });
    },

    render: function () {
      var parent = this.props.field.parent;
      var field = this.props.field;
      var item = field.field;
      var form = this.props.form;

      var className = formatic.className('object-item', plugin.config.className, field.className);
      var keyClassName = formatic.className('object-key', plugin.config.key_className, field.key_className);
      var keyInputClassName = formatic.className(plugin.config.keyInput_className, field.keyInput_className);
      var keyChoiceClassName = formatic.className(plugin.config.keyChoice_className, field.keyChoice_className);
      var valueClassName = formatic.className('object-value', plugin.config.value_className, field.value_className);
      var controlClassName = formatic.className('object-control', plugin.config.control_className, field.control_className);
      var removeClassName = formatic.className('object-control-remove', plugin.config.removeButton_className, field.removeButton_className);
      var removeLabel = plugin.configValue('removeButton_label', '[remove]');

      var propertyKey = item.propertyKey;

      propertyKey = this.props.form.isTempKey(propertyKey) ? '' : propertyKey;

      var keyInput;
      if (parent.keyChoices && parent.keyChoices.length > 0 && !this.state.useCustomKey) {
        var keyChoices = parent.keyChoices.slice(0);
        if (propertyKey === '') {
          keyChoices = [{value: '', label: ''}].concat(keyChoices);
        }
        if (!_.find(keyChoices, function (choice) {return choice.value === propertyKey;})) {
          keyChoices = keyChoices.concat([{value: propertyKey, label: propertyKey}]);
        }
        if (parent.customKeyChoice) {
          keyChoices = keyChoices.concat([{value: '--custom--', label: '--- Custom Key ---'}]);
        }
        keyInput = R.select({className: keyChoiceClassName, value: propertyKey, onChange: this.onChangeKey},
          keyChoices.map(function (choice) {
            return R.option({value: choice.value}, choice.label);
          })
        );

      } else {
        keyInput = R.input({className: keyInputClassName, type: 'text', value: propertyKey, onChange: this.onChangeKey});
      }

      return R.div(_.extend({className: className, style: {background: this.state.maybeDelete ? 'rgb(255,200,200)' : ''}}, plugin.config.attributes),
        R.div({className: keyClassName},
          parent.itemKeyLabel ? R.span({}, parent.itemKeyLabel) : null,
          keyInput
        ),
        R.div({className: valueClassName},
          form.component({
            type: 'field',
            field: item
          })
        ),
        R.div({className: controlClassName},
          R.div({className: removeClassName, onMouseOver: this.onMouseOver, onMouseOut: this.onMouseOut, onClick: this.onDelete}, removeLabel)
        )
      );
    }
  });
};
