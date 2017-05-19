// # label component

/*
Just the label for a field.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

module.exports = React.createClass({

  displayName: 'Label',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;
    var fieldLabel = config.fieldLabel(field);
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
        <span className={config.fieldIsRequired(field) ? 'required-text' : 'not-required-text'} />
      </div>
    );
  }
});
