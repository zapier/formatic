// # array-item component

/*
Render an array item.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';
import _ from '@/src/undash';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'ArrayItem',

  mixins: [HelperMixin],

  getInitialState: function() {
    return {
      isMaybeRemoving: false,
    };
  },

  render: function() {
    return this.renderWithConfig();
  },

  onMaybeRemove: function(isMaybeRemoving) {
    this.setState({
      isMaybeRemoving,
    });
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const classes = _.extend({}, this.props.classes);

    if (this.state.isMaybeRemoving) {
      classes['maybe-removing'] = true;
    }

    let arrayItemControl;
    if (!config.fieldIsReadOnly(field)) {
      arrayItemControl = config.createElement('array-item-control', {
        parentTypeName: this.props.parentTypeName,
        field,
        index: this.props.index,
        numItems: this.props.numItems,
        onMove: this.props.onMove,
        onRemove: this.props.onRemove,
        onMaybeRemove: this.onMaybeRemove,
      });
    }

    const arrayItemValue = config.createElement('array-item-value', {
      parentTypeName: this.props.parentTypeName,
      field,
      index: this.props.index,
      onChange: this.props.onChange,
      onAction: this.onBubbleAction,
    });

    return (
      <div className={cx(classes)} renderWith={this.renderWith('ListItem')}>
        {arrayItemValue}
        {arrayItemControl}
      </div>
    );
  },
});
