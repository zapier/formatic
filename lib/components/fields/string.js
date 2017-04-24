// # string component

/*
Render a field that can edit a string value.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

module.exports = createReactClass({

  displayName: 'String',

  mixins: [require('../../mixins/field')],

  onChange: function (event) {
    this.onChangeValue(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    },
      <textarea
        value={field.value}
        className={cx(this.props.classes)}
        rows={field.rows || this.props.rows}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        onBlur={this.onBlurAction}
        disabled={this.isReadOnly()} />
    );
  }
});
