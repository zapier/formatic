// # move-item-forward component

/*
Button to move an item forward in a list.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'MoveItemForward',

  mixins: [HelperMixin],

  getDefaultProps: function() {
    return {
      label: '▼',
    };
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return (
      <button
        className={cx(this.props.classes)}
        onClick={this.props.onClick}
        renderWith={this.renderWith('MoveItemForward')}
        tabIndex={0}
      >
        {this.props.label}
      </button>
    );
  },
});
