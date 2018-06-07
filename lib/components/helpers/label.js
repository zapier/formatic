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
    var config = this.props.config;
    var field = this.props.field;
    var fieldLabel = config.fieldLabel(field);
    var fieldIsRequired = config.fieldIsRequired(field);
    var requiredText = config.fieldRequiredText(field);
    var requiredTextClassName = cx({
      'required-text': fieldIsRequired,
      'not-required-text': !fieldIsRequired,
      'has-required-text': !!requiredText,
    });
    var label = null;

    if (typeof this.props.index === 'number') {
      label = '' + (this.props.index + 1) + '.';

      if (fieldLabel) {
        label = label + ' ' + fieldLabel;
      }
    }

    if (fieldLabel || label) {
      var text = label || fieldLabel;

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
        <span className={requiredTextClassName}>{requiredText}</span>
      </div>
    );
  }
});
