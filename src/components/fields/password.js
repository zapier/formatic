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
  displayName: 'Password',

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

    return config.createElement(
      'field',
      {
        typeName: 'Password',
        config,
        field,
        id: this.state.id,
        plain: this.props.plain,
      },
      <input
        autoComplete={field.autoComplete}
        autoFocus={field.autoFocus}
        className={cx(this.props.classes)}
        disabled={this.isReadOnly()}
        id={this.state.id}
        onBlur={this.onBlurAction}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        placeholder={field.placeholder}
        renderWith={this.renderWith('PasswordInput')}
        type="password"
        value={this.props.field.value}
      />
    );
  },
});
