// # help component

/*
Just the help text block.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

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
        renderWith={this.renderWith('Help')}
        className={cx(this.props.classes)}
        dangerouslySetInnerHTML={{ __html: helpText }}
      />
    ) : (
      <span renderWith={this.renderWith('EmptyHelp')} />
    );
  },
});
