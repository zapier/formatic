// # remove-item component

/*
Remove an item.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '@/src/undash';
import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'RemoveItem',

  mixins: [HelperMixin],

  getDefaultProps: function() {
    return {
      label: '-',
    };
  },

  render: function() {
    return this.renderWithConfig();
  },

  onMouseOverRemove: function() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(true);
    }
  },

  onMouseOutRemove: function() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(false);
    }
  },

  renderDefault: function() {
    if (this.props.readOnly) {
      const classes = _.extend({}, this.props.classes, {
        'readonly-control': this.props.readOnly,
      });

      return (
        <button
          renderWith={this.renderWith('ReadOnlyRemoveItem')}
          className={cx(classes)}
        >
          {this.props.label}
        </button>
      );
    }

    const onKeyDown = event => {
      if (event.keyCode === 13) {
        this.props.onClick(event);
      }
    };

    return (
      <button
        renderWith={this.renderWith('RemoveItem')}
        tabIndex={0}
        className={cx(this.props.classes)}
        onKeyDown={onKeyDown}
        onClick={this.props.onClick}
        onMouseOver={this.onMouseOverRemove}
        onMouseOut={this.onMouseOutRemove}
      >
        {this.props.label}
      </button>
    );
  },
});
