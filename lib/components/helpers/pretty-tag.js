// # pretty-tag component

/*
   Pretty text tag
 */

'use strict';

import React from 'react';
import cx from 'classnames';

import _ from '../../undash';
import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'PrettyTag',

  propTypes: {
    onClick: React.PropTypes.func,
    classes: React.PropTypes.object
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
