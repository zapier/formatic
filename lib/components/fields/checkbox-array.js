// # checkbox-array component

/*
Used with array values to supply multiple checkboxes for adding multiple
enumerated values to an array.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '../../undash';
import FieldMixin from '../../mixins/field';
import { ref } from '../../utils';

export default createReactClass({

  displayName: 'CheckboxArray',

  mixins: [FieldMixin],

  getInitialState: function () {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  onChange: function () {
    // Get all the checked checkboxes and convert to an array of values.
    var choiceNodes = this.choices.getElementsByTagName('input');
    choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
    var values = choiceNodes.map(function (node) {
      return node.checked ? node.value : null;
    }).filter(function (value) {
      return value;
    });
    this.onChangeValue(values);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    var choices = this.state.choices || [];

    var isInline = !_.find(choices, function (choice) {
      return choice.sample;
    });

    const inputs = choices.map(function (choice, i) {
      const inputField = (
        <span style={{ whiteSpace: 'nowrap' }}>
          <input
            name={field.key}
            type="checkbox"
            value={choice.value}
            checked={field.value.indexOf(choice.value) >= 0 ? true : false}
            onChange={this.onChange}
            onFocus={this.onFocusAction}
            onBlur={this.onBlurAction}
            disabled={this.isReadOnly()} />
            <span className="field-choice-label">
              {choice.label}
            </span>
        </span>
      );

      if (isInline) {
        return (
          <span key={i} className="field-choice">
            {inputField}
            {' '}
          </span>
        );
      }

      return (
        <span key={i} className="field-choice">
          {inputField}
          {' '}
          {config.createElement('sample', {field: field, choice: choice})}
        </span>
      );
    }.bind(this));

    return config.createElement('field', {
      field: field
    },
      <div className={cx(this.props.classes)} ref={ref(this, 'choices')}>
        {inputs}
      </div>
    );
  }
});
