// # select component

/*
Render select element to give a user choices for the value of a field. Renders non-native
select drop down and supports fancier renderings.
*/

'use strict';

import createReactClass from 'create-react-class';

import FieldMixin from '../../mixins/field';

export default createReactClass({

  displayName: 'PrettySelect',

  mixins: [FieldMixin],

  getInitialState: function () {
    return {
      choices: this.props.config.fieldPrettyChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({
      choices: newProps.config.fieldPrettyChoices(newProps.field)
    });
  },

  render: function () {
    return this.renderWithConfig();
  },

  onChange: function (value, info) {
    if (info && info.isCustomValue) {
      this.props.onChange(value, {
        field: this.props.field,
        isCustomValue: true
      });
    } else {
      this.onChangeValue(value);
    }
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain, classes: this.props.classes
    }, config.createElement('pretty-select-value', {
      choices: this.state.choices, isAccordion: field.isAccordion, isAccordionAlwaysCollapsable: field.isAccordionAlwaysCollapsable, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});
