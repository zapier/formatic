// # json component

/*
Textarea editor for JSON. Will validate the JSON before setting the value, so
while the value is invalid, no external state changes will occur.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'Json',

  mixins: [FieldMixin],

  getDefaultProps: function() {
    return {
      rows: 5,
    };
  },

  isValidValue: function(value) {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  },

  getInitialState: function() {
    return {
      isValid: true,
      value: JSON.stringify(this.props.field.value, null, 2),
    };
  },

  onChange: function(event) {
    const isValid = this.isValidValue(event.target.value);

    if (isValid) {
      // Need to handle this better. Need to track position.
      this._isChanging = true;
      this.onChangeValue(JSON.parse(event.target.value));
    }

    this.setState({
      isValid,
      value: event.target.value,
    });
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this._isChanging) {
      this.setState({
        isValid: true,
        value: JSON.stringify(nextProps.field.value, null, 2),
      });
    }
    this._isChanging = false;
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
        typeName: 'Json',
        field: config.fieldWithValue(field, this.state.value),
        id: this.state.id,
        plain: this.props.plain,
      },
      <textarea
        className={cx(this.props.classes)}
        disabled={this.isReadOnly()}
        id={this.state.id}
        onBlur={this.onBlurAction}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        renderWith={this.renderWith('TextareaInput', {
          isValid: this.state.isValid,
        })}
        rows={config.fieldRows(field) || this.props.rows}
        value={this.state.value}
      />
    );
  },
});
