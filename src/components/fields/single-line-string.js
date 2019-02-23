// # single-line-string component

/*
Render a single line text input.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'SingleLineString',

  mixins: [FieldMixin],

  onChange: function(event) {
    this.onChangeValue(event.target.value);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const readOnly = config.fieldIsReadOnly(field);
    const tabIndex = readOnly ? -1 : this.props.tabIndex || 0;

    return config.createElement(
      'field',
      {
        typeName: 'SingleLineString',
        config,
        field,
        plain: this.props.plain,
      },
      <input
        autoComplete={field.autoComplete}
        autoFocus={field.autoFocus}
        className={cx(this.props.classes)}
        onBlur={this.onBlurAction}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        placeholder={field.placeholder}
        readOnly={readOnly}
        renderWith={this.renderWith('TextInput')}
        tabIndex={tabIndex}
        type="text"
        value={this.props.field.value}
      />
    );
  },
});
