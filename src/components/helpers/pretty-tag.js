'use strict';

// # pretty-tag component

/*
   Pretty text tag
 */

import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '@/src/undash';
import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'PrettyTag',

  propTypes: {
    onClick: PropTypes.func,
    classes: PropTypes.object,
  },

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const classes = cx(
      _.extend({}, this.props.classes, { 'pretty-part': true })
    );

    return (
      // CodeMirror widgets need some work to make them accessible.
      // eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/click-events-have-key-events
      <span
        className={classes}
        onClick={this.props.onClick}
        renderWith={this.renderWith('PrettyTag')}
        role="button"
      >
        {this.props.children}
      </span>
    );
  },
});
