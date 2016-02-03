// # choices-search component

/*
   Render a search box for choices.
 */

'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'ChoicesSearch',

  mixins: [require('../../mixins/helper')],

  focus: function focus() {
    this.refs.input.focus();
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'div',
      { className: 'choices-search' },
      React.createElement('input', { ref: 'input', type: 'text', placeholder: 'Search...', onChange: this.props.onChange })
    );
  }

});