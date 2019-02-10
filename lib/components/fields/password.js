// # single-line-string component

/*
Render a single line text input.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '../../mixins/field';

/** @jsx jsx */
import jsx from '../../jsx';

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
        config,
        field,
        plain: this.props.plain,
      },
      <input
        renderWith={this.renderWith('PasswordInput')}
        type="password"
        value={this.props.field.value}
        className={cx(this.props.classes)}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        onBlur={this.onBlurAction}
        autoComplete={field.autoComplete}
        autoFocus={field.autoFocus}
        placeholder={field.placeholder}
        disabled={this.isReadOnly()}
      />
    );
  },
});
