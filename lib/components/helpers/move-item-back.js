// # move-item-back component

/*
Button to move an item backwards in list.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

export default createReactClass({
  displayName: 'MoveItemBack',

  mixins: [HelperMixin],

  getDefaultProps: function() {
    return {
      label: '▲',
    };
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return (
      <button
        renderWith={this.renderWith('MoveItemBack')}
        tabIndex={0}
        className={cx(this.props.classes)}
        onClick={this.props.onClick}
      >
        {this.props.label}
      </button>
    );
  },
});
