// # assoc-item-key component

/*
Render an object item key editor.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';
import _ from '@/src/undash';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'AssocListItemKey',

  mixins: [HelperMixin],

  onChange: function(event) {
    this.props.onChange(event.target.value);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const classes = _.extend({}, this.props.classes);
    if (this.props.isDuplicateKey) {
      classes['validation-error-duplicate-key'] = true;
    }

    return (
      <input
        aria-label={`key_${this.props.index}`}
        className={cx(classes)}
        onBlur={this.onBlurAction}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        renderWith={this.renderWith('ListItemKeyInput')}
        type="text"
        value={this.props.displayKey}
      />
    );
  },
});
