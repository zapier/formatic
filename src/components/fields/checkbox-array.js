// # checkbox-array component

/*
Used with array values to supply multiple checkboxes for adding multiple
enumerated values to an array.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '@/src/undash';
import FieldMixin from '@/src/mixins/field';
import { ref } from '@/src/utils';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'CheckboxArray',

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

  onChange: function() {
    // Get all the checked checkboxes and convert to an array of values.
    let choiceNodes = this.choicesRef.getElementsByTagName('input');
    choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
    const values = choiceNodes
      .map(function(node) {
        return node.checked ? node.value : null;
      })
      .filter(function(value) {
        return value;
      });
    this.onChangeValue(values);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const choices = this.state.choices || [];

    const isInline = !_.find(choices, function(choice) {
      return choice.sample;
    });

    const inputs = choices.map(
      function(choice, i) {
        const choiceId = `choice_${i}_${this.state.id}`;
        const inputField = (
          <span
            renderWith={this.renderWith('InputWrapper')}
            style={{ whiteSpace: 'nowrap' }}
          >
            <input
              aria-labelledby={`${this.state.id}_label`}
              checked={field.value.indexOf(choice.value) >= 0 ? true : false}
              disabled={this.isReadOnly()}
              id={choiceId}
              name={field.key}
              onBlur={this.onBlurAction}
              onChange={this.onChange}
              onFocus={this.onFocusAction}
              renderWith={this.renderWith('CheckboxInput')}
              type="checkbox"
              value={choice.value}
            />
            <span key="spacer" renderWith={this.renderWith('InputSpacer')}>
              {' '}
            </span>
            <label
              className="field-choice-label"
              htmlFor={choiceId}
              renderWith={this.renderWith('ChoiceLabel')}
            >
              {choice.label}
            </label>
          </span>
        );

        if (isInline) {
          return (
            <span
              className="field-choice"
              key={i}
              renderWith={this.renderWith('Choice')}
            >
              {inputField}{' '}
            </span>
          );
        }

        return (
          <span
            className="field-choice"
            key={i}
            renderWith={this.renderWith('Choice')}
          >
            {inputField}{' '}
            {config.createElement('sample', {
              typeName: 'CheckboxArray',
              field,
              choice,
            })}
          </span>
        );
      }.bind(this)
    );

    return config.createElement(
      'field',
      {
        typeName: 'CheckboxArray',
        field,
        id: this.state.id,
      },
      <div
        aria-labelledby={`${this.state.id}_label`}
        className={cx(this.props.classes)}
        ref={ref(this, 'choices')}
        renderWith={this.renderWith('FieldBody')}
        role="group"
      >
        {inputs}
      </div>
    );
  },
});
