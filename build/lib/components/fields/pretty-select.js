// # select component

/*
Render select element to give a user choices for the value of a field. Renders non-native
select drop down and supports fancier renderings.
*/

'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'PrettySelect',

  mixins: [require('../../mixins/field')],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldPrettyChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldPrettyChoices(newProps.field)
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onChange: function onChange(value, info) {
    if (info && info.isCustomValue) {
      this.props.onChange(value, {
        field: this.props.field,
        isCustomValue: true
      });
    } else {
      this.onChangeValue(value);
    }
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain, classes: this.props.classes
    }, config.createElement('pretty-select-value', {
      choices: this.state.choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});