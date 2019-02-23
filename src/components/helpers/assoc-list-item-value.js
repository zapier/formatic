// # assoc-item-value component

/*
Render the value of an object item.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'AssocListItemValue',

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

    const fieldElem = config.createFieldElement({
      field,
      onChange: this.onChangeField,
      plain: true,
      onAction: this.onBubbleAction,
    });

    return (
      <div
        renderWith={this.renderWith('ListItemValue')}
        className={cx(this.props.classes)}
      >
        {fieldElem}
      </div>
    );
  },
});
