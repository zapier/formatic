'use strict';

var React = require('react');

var createReactClass = require('create-react-class');

module.exports = createReactClass({

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
