'use strict';

var React = require('react/addons');

module.exports = React.createClass({

  displayName: 'Boolean',

  mixins: [require('../../mixins/field')],

  onChange: function (newValue) {
    this.onChangeValue(newValue);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    var choices = config.fieldChoices(field);

    if (choices.length === 0) {
      choices = [{
        label: 'Yes',
        value: true
      }, {
        label: 'No',
        value: false
      }];
    }

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, config.createElement('select-value', {
      choices: choices, value: this.props.value, onChange: this.onChange
    }));
  }
});
