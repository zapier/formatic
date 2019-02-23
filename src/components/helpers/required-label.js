// # required label component

/*
  Required Label for a field
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'RequiredLabel',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;
    const fieldIsRequired = config.fieldIsRequired(field);
    const className = cx('required-label', {
      'required-text': fieldIsRequired,
      'not-required-text': !fieldIsRequired,
    });

    return (
      <span
        className={className}
        renderWith={this.renderWith('RequiredLabel')}
      />
    );
  },
});
