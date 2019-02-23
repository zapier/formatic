// # help component

/*
Just the help text block.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'Help',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const helpText = this.props.config.fieldHelpText(this.props.field);

    return helpText ? (
      <div
        className={cx(this.props.classes)}
        dangerouslySetInnerHTML={{ __html: helpText }}
        renderWith={this.renderWith('Help')}
      />
    ) : (
      <span renderWith={this.renderWith('EmptyHelp')} />
    );
  },
});
