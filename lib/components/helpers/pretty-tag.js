// # pretty-tag component

/*
   Pretty text tag
 */

'use strict';

import React from 'react';
import _ from '../../undash';
import cx from 'classnames';

export default React.createClass({

  displayName: 'PrettyTag',

  propTypes: {
    onClick: React.PropTypes.func,
    classes: React.PropTypes.object
  },

  mixins: [require('../../mixins/helper')],

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
