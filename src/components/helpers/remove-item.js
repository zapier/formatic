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
          className={cx(classes)}
          renderWith={this.renderWith('ReadOnlyRemoveItem')}
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
      // This hover is hardly useful and maybe should be removed anyway.
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      <button
        className={cx(this.props.classes)}
        onClick={this.props.onClick}
        onKeyDown={onKeyDown}
        onMouseOut={this.onMouseOutRemove}
        onMouseOver={this.onMouseOverRemove}
        renderWith={this.renderWith('RemoveItem')}
        tabIndex={0}
      >
        {this.props.label}
      </button>
    );
  },
});
