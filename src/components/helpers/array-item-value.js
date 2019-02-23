// # array-item-value component

/*
Render the value of an array item.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'ArrayItemValue',

  mixins: [HelperMixin],

  onChangeField: function(newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    return (
      <div
        className={cx(this.props.classes)}
        renderWith={this.renderWith('ListItemValue')}
      >
        {config.createFieldElement({
          field,
          onChange: this.onChangeField,
          onAction: this.onBubbleAction,
        })}
      </div>
    );
  },
});
