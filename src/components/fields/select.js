// # select component

/*
Render select element to give a user choices for the value of a field. Note
it should support values other than strings. Currently this is only tested for
boolean values, but it _should_ work for other values.
*/

'use strict';

import createReactClass from 'create-react-class';

import FieldMixin from '@/src/mixins/field';

export default createReactClass({
  displayName: 'Select',

  mixins: [FieldMixin],

  getInitialState: function() {
    return {
      choices: this.props.config.fieldChoices(this.props.field),
    };
  },

  componentWillReceiveProps: function(newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field),
    });
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    return config.createElement(
      'field',
      {
        typeName: 'Select',
        config,
        field,
        id: this.state.id,
        plain: this.props.plain,
      },
      config.createElement('select-value', {
        choices: this.state.choices,
        field,
        id: this.state.id,
        onChange: this.onChangeValue,
        onAction: this.onBubbleAction,
      })
    );
  },
});
