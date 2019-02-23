// # ChoiceSectionHeader component

/*
Render section header in choices dropdown
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'ChoiceSectionHeader',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const choice = this.props.choice;
    return (
      <span
        className={cx(this.props.classes)}
        renderWith={this.renderWith('ChoiceSectionHeader')}
      >
        {choice.label}
      </span>
    );
  },
});
