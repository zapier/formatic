// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'CheckboxBoolean',

  mixins: [FieldMixin],

  onChange: function(event) {
    this.onChangeValue(event.target.checked);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const fieldLabelOrHelp =
      config.fieldHelpText(field) || config.fieldLabel(field);

    return config.createElement(
      'field',
      {
        typeName: 'CheckboxBoolean',
        config,
        field,
        plain: true,
      },
      <span
        renderWith={this.renderWith('FieldBody')}
        style={{ whiteSpace: 'nowrap' }}
      >
        <input
          checked={field.value}
          className={cx(this.props.classes)}
          disabled={this.isReadOnly()}
          id={this.state.id}
          key="input"
          onBlur={this.onBlurAction}
          onChange={this.onChange}
          onFocus={this.onFocusAction}
          renderWith={this.renderWith('CheckboxInput')}
          type="checkbox"
        />
        <span key="spacer" renderWith={this.renderWith('InputSpacer')}>
          {' '}
        </span>
        <label
          htmlFor={this.state.id}
          key="label"
          renderWith={this.renderWith('InputLabel')}
        >
          {fieldLabelOrHelp}
        </label>
      </span>
    );
  },
});
