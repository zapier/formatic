// # copy component

/*
Render non-editable html/text (think article copy).
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

module.exports = createReactClass({

  displayName: 'Copy',

  mixins: [require('../../mixins/field')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div
        className={cx(this.props.classes)}
        dangerouslySetInnerHTML={{ __html: this.props.config.fieldHelpText(this.props.field) }} />
    );
  }
});
