// # assoc-item-key component

/*
Render an object item key editor.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';
import _ from '../../undash';

import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'AssocListItemKey',

  mixins: [HelperMixin],

  onChange: function (event) {
    this.props.onChange(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    const classes = _.extend({}, this.props.classes);
    if (this.props.isDuplicateKey) {
      classes['validation-error-duplicate-key'] = true;
    }

    return (
      <input
        className={cx(classes)}
        type="text"
        value={this.props.displayKey}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        onBlur={this.onBlurAction} />
    );
  }
});
