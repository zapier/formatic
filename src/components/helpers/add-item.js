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
        renderWith={this.renderWith('AddItem')}
        role="button"
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        className={cx(this.props.classes)}
        onClick={this.props.onClick}
      >
        {this.props.label}
      </button>
    );
  },
});
