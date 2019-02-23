'use strict';

// # button component

/*
  Clickable 'button'
*/

import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

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
        className={cx({ 'readonly-control': this.props.readOnly })}
        href={'JavaScript' + ':'}
        onClick={this.props.onClick}
        renderWith={this.renderWith('InsertButton')}
      >
        {this.props.children}
      </a>
    );
  },
});
