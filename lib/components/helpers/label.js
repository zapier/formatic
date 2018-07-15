// # label component

/*
Just the label for a field.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'Label',

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    const config = this.props.config;
    const field = this.props.field;
    const fieldLabel = config.fieldLabel(field);
    const requiredLabel = config.createElement('required-label', {
      config,
      field,
    });
    let label = null;


    if (typeof this.props.index === 'number') {
      label = '' + (this.props.index + 1) + '.';

      if (fieldLabel) {
        label = label + ' ' + fieldLabel;
      }
    }

    if (fieldLabel || label) {
      let text = label || fieldLabel;

      if (this.props.onClick) {
        text = (
          <a href={'JavaScript' + ':'} onClick={this.props.onClick}>
            {text}
          </a>
        );
      }

      label = (
        <label>{text}</label>
      );
    }

    return (
      <div className={cx(this.props.classes)}>
        {label}
        {' '}
        {requiredLabel}
      </div>
    );
  }
});
