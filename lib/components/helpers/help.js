// # help component

/*
Just the help text block.
*/

'use strict';

import React from 'react';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'Help',

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var helpText = this.props.config.fieldHelpText(this.props.field);

    return helpText ?
      <div className={cx(this.props.classes)}
        dangerouslySetInnerHTML={{ '__html': helpText }} /> :
      <span></span>;
  }
});
