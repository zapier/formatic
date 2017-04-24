// # assoc-item-key component

/*
Render an object item key editor.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');
var _ = require('../../undash');

module.exports = createReactClass({

  displayName: 'AssocListItemKey',

  mixins: [require('../../mixins/helper')],

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
