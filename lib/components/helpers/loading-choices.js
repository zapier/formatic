'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'LoadingChoices',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div>Loading choices...</div>
    );
  }

});
