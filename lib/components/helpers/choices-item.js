// # choices-item component

/*
   Render a choice item wrapper.
 */

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '../../undash';
import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

export default createReactClass({
  displayName: 'ChoicesItem',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const classes = _.extend({}, this.props.classes);

    classes.choice = true;
    if (this.props.isHovering) {
      classes.hover = true;
    }

    return (
      <li renderWith={this.renderWith('ChoicesItem')} className={cx(classes)}>
        {this.props.children}
      </li>
    );
  },
});
