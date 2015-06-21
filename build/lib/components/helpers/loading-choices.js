'use strict';

var React = require('react/addons');

module.exports = React.createClass({

  displayName: 'LoadingChoices',

  mixins: [require('../../mixins/helper')],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'div',
      null,
      'Loading choices...'
    );
  }

});