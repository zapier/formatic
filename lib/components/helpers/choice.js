// # choice component

/*
A single choice in a list of choices.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';
import { ref } from '../../utils';

export default createReactClass({
  // This component also renders InfoChoice, ActionChoice, and SectionChoice.
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
    const { choice, label } = this.props;

    const anchorClasses =
      cx(
        {
          'action-choice': choice.action,
        },
        choice.action
      ) || undefined;

    const labelClasses = cx('choice-label', choice.action);

    return (
      // Keyboard accessible with up/down arrows.
      // eslint-disable-next-line jsx-a11y/interactive-supports-focus
      <a
        role="option"
        style={{ cursor: 'pointer' }}
        onClick={this.onSelect}
        className={anchorClasses}
      >
        {choice.sectionKey ? (
          this.props.config.createElement('choice-section-header', {
            choice,
            isOpen: this.props.isOpen,
            isDisabled: this.props.isDisabled,
          })
        ) : (
          <React.Fragment>
            <span ref={ref(this, 'label')} className={labelClasses}>
              {label || choice.label}
            </span>
            {choice.action ? (
              this.props.config.createElement('choice-action-sample', {
                action: choice.action,
                choice,
              })
            ) : label ? null : (
              <span className="choice-sample">
                {this.sampleString(choice.sample)}
              </span>
            )}
          </React.Fragment>
        )}
      </a>
    );
  },
});
