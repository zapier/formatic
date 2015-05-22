// # pretty boolean component

/*
Render pretty boolean component with non-native drop-down
*/

'use strict';

var React = require('react/addons');

module.exports = React.createClass({

  displayName: 'PrettyBoolean',

  mixins: [require('../../mixins/field')],

  onChange: function onChange(newValue) {
    this.onChangeValue(newValue);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var choices = config.fieldBooleanChoices(field);

    return config.createElement('field', {
      field: field, plain: this.props.plain
    }, config.createElement('pretty-select-value', {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});