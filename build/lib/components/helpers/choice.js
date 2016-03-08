// # choice component

/*
A single choice in a list of choices.
*/

'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'Choice',

  mixins: [require('../../mixins/helper')],

  render: function render() {
    return this.renderWithConfig();
  },

  onSelect: function onSelect() {
    this.props.onSelect(this.props.choice);
  },

  sampleString: function sampleString(sample) {
    if (typeof sample === 'boolean') {
      return String(sample);
    }
    return sample;
  },

  renderDefault: function renderDefault() {
    var choice = this.props.choice;

    return React.createElement(
      'a',
      { style: { cursor: 'pointer' }, onClick: this.onSelect },
      React.createElement(
        'span',
        { ref: 'label', className: 'choice-label' },
        choice.label
      ),
      React.createElement(
        'span',
        { className: 'choice-sample' },
        this.sampleString(choice.sample)
      )
    );
  }
});