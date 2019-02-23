// # move-item-forward component

/*
Button to move an item forward in a list.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

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
        renderWith={this.renderWith('MoveItemForward')}
        tabIndex={0}
        className={cx(this.props.classes)}
        onClick={this.props.onClick}
      >
        {this.props.label}
      </button>
    );
  },
});
