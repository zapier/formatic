// # ChoiceSectionHeader component

/*
Render section header in choices dropdown
*/

'use strict';

var React = require('react');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'ChoiceSectionHeader',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var choice = this.props.choice;
    return <span className={cx(this.props.classes)}>{choice.label}</span>;
  }
});
