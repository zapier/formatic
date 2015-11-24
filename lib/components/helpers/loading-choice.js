'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'LoadingChoice',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <span>Loading choices...</span>
    );
  }

});
