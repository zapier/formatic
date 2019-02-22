// # label component

/*
Just the label for a field.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

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
            renderWith={this.renderWith('LabelLink')}
            href={'JavaScript' + ':'}
            onClick={this.props.onClick}
          >
            {text}
          </a>
        );
      }

      label = <label renderWith={this.renderWith('LabelText')}>{text}</label>;
    }

    return (
      <div
        renderWith={this.renderWith('Label')}
        className={cx(this.props.classes)}
      >
        {label} {requiredLabel}
      </div>
    );
  },
});
