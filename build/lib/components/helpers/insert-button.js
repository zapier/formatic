// # button component

/*
  Clickable 'button'
*/

'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'InsertButton',

  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    ref: React.PropTypes.string
  },

  mixins: [require('../../mixins/helper')],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'a',
      { ref: this.props.ref, href: 'JavaScript' + ':', onClick: this.props.onClick },
      this.props.children
    );
  }

});