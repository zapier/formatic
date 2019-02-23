// # add-item component

/*
The add button to append an item to a field.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'AddItem',

  mixins: [HelperMixin],

  getDefaultProps: function() {
    return {
      label: '+',
    };
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const tabIndex = this.props.readOnly ? null : 0;

    const onKeyDown = event => {
      if (event.keyCode === 13) {
        this.props.onClick(event);
      }
    };

    return (
      <button
        className={cx(this.props.classes)}
        onClick={this.props.onClick}
        onKeyDown={onKeyDown}
        renderWith={this.renderWith('AddItem')}
        tabIndex={tabIndex}
      >
        {this.props.label}
      </button>
    );
  },
});
