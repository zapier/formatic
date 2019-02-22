// # select-value component

/*
Render a select dropdown for a list of choices. Choices values can be of any
type.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '../../undash';
import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

export default createReactClass({
  displayName: 'SelectValue',

  mixins: [HelperMixin],

  onChange: function(event) {
    const choiceValue = event.target.value;
    const choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
    if (choiceType === 'choice') {
      let choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    let choices = this.props.choices || [];

    let choicesOrLoading;

    if (
      (choices.length === 1 && choices[0].value === '///loading///') ||
      config.fieldIsLoading(this.props.field)
    ) {
      choicesOrLoading = config.createElement('loading-choices', {
        typeName: this.props.typeName,
        field: this.props.field,
      });
    } else {
      const value =
        this.props.field.value !== undefined ? this.props.field.value : '';

      choices = choices.map(function(choice, i) {
        return {
          choiceValue: 'choice:' + i,
          value: choice.value,
          label: choice.label,
        };
      });

      let valueChoice = _.find(choices, function(choice) {
        return choice.value === value;
      });

      if (valueChoice === undefined) {
        let label = value;
        if (!_.isString(value)) {
          label = JSON.stringify(value);
        }
        valueChoice = {
          choiceValue: 'value:',
          value,
          label,
        };
        choices = [valueChoice].concat(choices);
      }

      choicesOrLoading = (
        <select
          renderWith={this.renderWith('SelectValueSelectInput')}
          className={cx(this.props.classes)}
          onChange={this.onChange}
          value={valueChoice.choiceValue}
          onFocus={this.onFocusAction}
          onBlur={this.onBlurAction}
          disabled={this.isReadOnly()}
        >
          {choices.map((choice, i) => (
            <option
              renderWith={this.renderWith('SelectValueOption')}
              key={i}
              value={choice.choiceValue}
            >
              {choice.label}
            </option>
          ))}
        </select>
      );
    }

    return choicesOrLoading;
  },
});
