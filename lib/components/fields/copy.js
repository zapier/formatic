// # copy component

/*
Render non-editable html/text (think article copy).
*/

'use strict';

import React from 'react';
import cx from 'classnames';

import FieldMixin from '../../mixins/field';

export default React.createClass({

  displayName: 'Copy',

  mixins: [FieldMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div
        className={cx(this.props.classes)}
        dangerouslySetInnerHTML={{ __html: this.props.config.fieldHelpText(this.props.field) }} />
    );
  }
});
