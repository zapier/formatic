// # single-line-string component

/*
Render a single line text input.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '../../mixins/field';

export default createReactClass({

  displayName: 'SingleLineString',

  mixins: [FieldMixin],

  onChange: function (event) {
    this.onChangeValue(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    const config = this.props.config;
    const field = this.props.field;

    const readOnly = config.fieldIsReadOnly(field);
    const tabIndex = readOnly ? -1 : (this.props.tabIndex || 0);

    return config.createElement('field', {
      config, field, plain: this.props.plain
    },
    <input
      tabIndex={tabIndex}
      type="text"
      value={this.props.field.value}
      className={cx(this.props.classes)}
      onChange={this.onChange}
      onFocus={this.onFocusAction}
      onBlur={this.onBlurAction}
      autoComplete={field.autoComplete}
      autoFocus={field.autoFocus}
      placeholder={field.placeholder}
      readOnly={readOnly} />
    );
  }
});
