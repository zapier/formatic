// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '../../mixins/field';

/** @jsx jsx */
import jsx from '../../jsx';

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
        config,
        field,
        plain: true,
      },
      <span
        renderWith={this.renderWith('FieldBody')}
        style={{ whiteSpace: 'nowrap' }}
      >
        <input
          renderWith={this.renderWith('CheckboxInput')}
          key="input"
          type="checkbox"
          checked={field.value}
          className={cx(this.props.classes)}
          onChange={this.onChange}
          onFocus={this.onFocusAction}
          onBlur={this.onBlurAction}
          disabled={this.isReadOnly()}
        />
        <span renderWith={this.renderWith('InputSpacer')} key="spacer">
          {' '}
        </span>
        <span renderWith={this.renderWith('InputLabel')} key="label">
          {fieldLabelOrHelp}
        </span>
      </span>
    );
  },
});
