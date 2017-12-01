// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '../../mixins/field';

export default createReactClass({

  displayName: 'CheckboxBoolean',

  mixins: [FieldMixin],

  onChange: function (event) {
    this.onChangeValue(event.target.checked);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    const fieldLabelOrHelp = config.fieldHelpText(field) || config.fieldLabel(field);

    return config.createElement('field', {
      config: config, field: field, plain: true
    },
    <span style={{ whiteSpace: 'nowrap' }}>
      <input
        type="checkbox"
        checked={field.value}
        className={cx(this.props.classes)}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        onBlur={this.onBlurAction}
        disabled={this.isReadOnly()}
      />
      <span> </span>
      <span>{fieldLabelOrHelp}</span>
    </span>
    );
  }
});
