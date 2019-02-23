// # choices-item component

/*
   Render a choice item wrapper.
 */

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '@/src/undash';
import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

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
      <li
        className={cx(classes)}
        renderWith={this.renderWith('ChoicesItem', {
          isHovering: this.props.isHovering,
        })}
      >
        {this.props.children}
      </li>
    );
  },
});
