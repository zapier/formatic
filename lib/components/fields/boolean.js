// # boolean component

/*
Render a dropdown to handle yes/no boolean values.
*/

'use strict';

import createReactClass from 'create-react-class';

import FieldMixin from '../../mixins/field';

export default createReactClass({

  displayName: 'Boolean',

  mixins: [FieldMixin],

  onChange: function (newValue) {
    this.onChangeValue(newValue);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    var choices = config.fieldBooleanChoices(field);

    return config.createElement('field', {
      field: field, plain: this.props.plain
    }, config.createElement('select-value', {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});
