// # string component

/*
Render a field that can edit a string value.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'String',

  mixins: [FieldMixin],

  onChange: function(event) {
    this.onChangeValue(event.target.value);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    return config.createElement(
      'field',
      {
        typeName: this.props.typeName || 'String',
        config,
        field,
        id: this.state.id,
        plain: this.props.plain,
      },
      <textarea
        className={cx(this.props.classes)}
        disabled={this.isReadOnly()}
        id={this.state.id}
        onBlur={this.onBlurAction}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        renderWith={this.renderWith('TextareaInput')}
        rows={field.rows || this.props.rows}
        value={field.value}
      />
    );
  },
});
