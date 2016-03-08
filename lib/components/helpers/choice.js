// # choice component

/*
A single choice in a list of choices.
*/

'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'Choice',

  mixins: [require('../../mixins/helper')],

  render() {
    return this.renderWithConfig();
  },

  onSelect() {
    this.props.onSelect(this.props.choice);
  },

  sampleString(sample) {
    if (typeof sample === 'boolean') {
      return String(sample);
    }
    return sample;
  },

  renderDefault: function () {

    const {choice} = this.props;

    return (
      <a style={{cursor: 'pointer'}} onClick={this.onSelect}>
        <span ref="label" className="choice-label">{choice.label}</span>
        <span className="choice-sample">{this.sampleString(choice.sample)}</span>
      </a>
    );
  }
});
