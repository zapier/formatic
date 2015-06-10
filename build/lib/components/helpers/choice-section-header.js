// # ChoiceSectionHeader component

/*
Render section header in choices dropdown
*/

'use strict';

var React = require('react/addons');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'ChoiceSectionHeader',

  mixins: [require('../../mixins/helper')],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var choice = this.props.choice;
    return React.createElement(
      'span',
      { className: cx(this.props.classes) },
      choice.label
    );
  }
});