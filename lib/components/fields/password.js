// # single-line-string component

/*
Render a single line text input.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

module.exports = React.createClass({

  displayName: 'Password',

  mixins: [require('../../mixins/field')],

  onChange: function (event) {
    this.onChangeValue(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    },
      <input
        type="password"
        value={this.props.field.value}
        className={cx(this.props.classes)}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        onBlur={this.onBlurAction}
        autoComplete={field.autoComplete}
        autoFocus={field.autoFocus}
        placeholder={field.placeholder}
        disabled={this.isReadOnly()} />
    );
  }
});
