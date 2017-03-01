// # fieldset component

/**
 * Wraps the form in a fieldset
 */
'use strict';

var React = require('react');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'Fieldset',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <fieldset {...this.props} className={cx(this.props.classes)} />
    );
  }
});
