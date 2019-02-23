// # help component

/*
Just the help text block.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

export default createReactClass({
  displayName: 'Sample',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const choice = this.props.choice;

    return !choice.sample ? null : (
      <div
        renderWith={this.renderWith('Sample')}
        className={cx(this.props.className)}
      >
        {choice.sample}
      </div>
    );
  },
});
