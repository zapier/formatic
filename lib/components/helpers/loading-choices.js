'use strict';

var React = require('react');

var createReactClass = require('create-react-class');

module.exports = createReactClass({

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
