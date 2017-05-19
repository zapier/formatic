// # choices-item component

/*
   Render a choice item wrapper.
 */

'use strict';

import React from 'react';
import cx from 'classnames';

import _ from '../../undash';
import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'ChoicesItem',

  mixins: [HelperMixin],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var classes = _.extend({}, this.props.classes);

    classes.choice = true;
    if (this.props.isHovering) {
      classes.hover = true;
    }

    return (
      <li className={cx(classes)}>{this.props.children}</li>
    );
  }

});
