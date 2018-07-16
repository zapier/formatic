'use strict';

// # button component

/*
  Clickable 'button'
*/

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default createReactClass({
  displayName: 'InsertButton',

  propTypes: {
    onClick: PropTypes.func.isRequired,
  },

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return (
      <a
        href={'JavaScript' + ':'}
        onClick={this.props.onClick}
        className={cx({ 'readonly-control': this.props.readOnly })}
      >
        {this.props.children}
      </a>
    );
  },
});
