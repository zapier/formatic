// # choice component

/*
A single choice in a list of choices.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';
import { ref } from '@/src/utils';

/** @jsx jsx */
import jsx from '@/src/jsx';

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
    const { choice, label, field } = this.props;

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
      // eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events
      <a
        aria-selected={false}
        className={anchorClasses}
        onClick={this.onSelect}
        renderWith={this.renderWith('Choice')}
        role="option"
        style={{ cursor: 'pointer' }}
      >
        {choice.sectionKey ? (
          this.props.config.createElement('choice-section-header', {
            typeName: this.props.typeName,
            field,
            choice,
            isOpen: this.props.isOpen,
            isDisabled: this.props.isDisabled,
          })
        ) : (
          <React.Fragment>
            <span
              className={labelClasses}
              ref={ref(this, 'label')}
              renderWith={this.renderWith('ChoiceLabel')}
            >
              {label || choice.label}
            </span>
            {choice.action ? (
              this.props.config.createElement('choice-action-sample', {
                typeName: this.props.typeName,
                field,
                action: choice.action,
                choice,
              })
            ) : label ? null : (
              <span
                className="choice-sample"
                renderWith={this.renderWith('ChoiceSample')}
              >
                {this.sampleString(choice.sample)}
              </span>
            )}
          </React.Fragment>
        )}
      </a>
    );
  },
});
