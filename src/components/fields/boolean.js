// # boolean component

/*
Render a dropdown to handle yes/no boolean values.
*/

'use strict';

import createReactClass from 'create-react-class';

import FieldMixin from '@/src/mixins/field';

export default createReactClass({
  displayName: 'Boolean',

  mixins: [FieldMixin],

  onChange: function(newValue) {
    this.onChangeValue(newValue);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const choices = config.fieldBooleanChoices(field);

    return config.createElement(
      'field',
      {
        typeName: 'Boolean',
        field,
        id: this.state.id,
        plain: this.props.plain,
      },
      config.createElement('select-value', {
        choices,
        field,
        id: this.state.id,
        onChange: this.onChange,
        onAction: this.onBubbleAction,
      })
    );
  },
});
