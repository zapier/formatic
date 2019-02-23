// # copy component

/*
Render non-editable html/text (think article copy).
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'Copy',

  mixins: [FieldMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return (
      <div
        className={cx(this.props.classes)}
        dangerouslySetInnerHTML={{
          __html: this.props.config.fieldHelpText(this.props.field),
        }}
        renderWith={this.renderWith('FieldBody')}
      />
    );
  },
});
