// # pretty boolean component

/*
Render pretty boolean component with non-native drop-down
*/

'use strict';

import createReactClass from 'create-react-class';

import FieldMixin from '../../mixins/field';

export default createReactClass({

  displayName: 'PrettyBoolean',

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
    }, config.createElement('pretty-select-value', {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});
