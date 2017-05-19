// # button component

/*
  Clickable 'button'
*/

'use strict';

import React from 'react';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'InsertButton',

  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <a href={'JavaScript' + ':'} onClick={this.props.onClick}
         className={cx({ 'readonly-control': this.props.readOnly })}>
        {this.props.children}
      </a>
    );
  }

});
