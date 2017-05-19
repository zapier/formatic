// # copy component

/*
Render non-editable html/text (think article copy).
*/

'use strict';

import React from 'react';
import cx from 'classnames';

module.exports = React.createClass({

  displayName: 'Copy',

  mixins: [require('../../mixins/field')],

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
