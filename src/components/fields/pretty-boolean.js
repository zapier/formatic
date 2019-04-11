// # pretty boolean component

/*
Render pretty boolean component with non-native drop-down
*/

'use strict';

import createReactClass from 'create-react-class';

import FieldMixin from '@/src/mixins/field';

export default createReactClass({
  displayName: 'PrettyBoolean',

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
        typeName: 'PrettyBoolean',
        field,
        id: this.state.id,
        plain: this.props.plain,
      },
      config.createElement('pretty-select-value', {
        typeName: 'PrettyBoolean',
        choices,
        field,
        id: this.state.id,
        onChange: this.onChange,
        onAction: this.onBubbleAction,
      })
    );
  },
});
