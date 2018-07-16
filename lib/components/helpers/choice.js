// # choice component

/*
A single choice in a list of choices.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';

import HelperMixin from '../../mixins/helper';
import { ref } from '../../utils';

export default createReactClass({
  displayName: 'Choice',

  mixins: [HelperMixin],

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

  renderDefault: function() {
    const { choice } = this.props;

    return (
      // Keyboard accessible with up/down arrows.
      // eslint-disable-next-line jsx-a11y/interactive-supports-focus
      <a role="option" style={{ cursor: 'pointer' }} onClick={this.onSelect}>
        <span ref={ref(this, 'label')} className="choice-label">
          {choice.label}
        </span>
        <span className="choice-sample">
          {this.sampleString(choice.sample)}
        </span>
      </a>
    );
  },
});
