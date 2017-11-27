'use strict';

// # pretty-tag component

/*
   Pretty text tag
 */

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '../../undash';
import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'PrettyTag',

  propTypes: {
    onClick: PropTypes.func,
    classes: PropTypes.object
  },

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var classes = cx(_.extend({}, this.props.classes, {'pretty-part': true}));

    return (
      <span className={classes} onClick={this.props.onClick}>
        {this.props.children}
      </span>
    );
  }
});
