// # assoc-item-key component

/*
Render an object item key editor.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';
import _ from '../../undash';

import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

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
        renderWith={this.renderWith('ItemKeyInput')}
        className={cx(classes)}
        type="text"
        value={this.props.displayKey}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        onBlur={this.onBlurAction}
      />
    );
  },
});
