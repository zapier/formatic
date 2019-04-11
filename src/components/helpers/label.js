// # label component

/*
Just the label for a field.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'Label',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;
    const fieldLabel = config.fieldLabel(field);
    const requiredLabel = config.createElement('required-label', {
      typeName: this.props.typeName,
      config,
      field,
    });
    let label = null;

    if (typeof this.props.index === 'number') {
      label = '' + (this.props.index + 1) + '.';

      if (fieldLabel) {
        label = label + ' ' + fieldLabel;
      }
    }

    if (fieldLabel || label) {
      let text = label || fieldLabel;

      if (this.props.onClick) {
        text = (
          <a
            href={'JavaScript' + ':'}
            onClick={this.props.onClick}
            renderWith={this.renderWith('LabelLink')}
          >
            {text}
          </a>
        );
      }

      label = (
        <label
          htmlFor={this.props.id}
          id={this.props.id ? `${this.props.id}_label` : undefined}
          renderWith={this.renderWith('LabelText')}
        >
          {text}
        </label>
      );
    }

    return (
      <div
        className={cx(this.props.classes)}
        renderWith={this.renderWith('Label')}
      >
        {label} {requiredLabel}
      </div>
    );
  },
});
