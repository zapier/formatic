// # help component

/*
Just the help text block.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

module.exports = createReactClass({

  displayName: 'Help',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var helpText = this.props.config.fieldHelpText(this.props.field);

    return helpText ?
      <div className={cx(this.props.classes)}
        dangerouslySetInnerHTML={{ '__html': helpText }} /> :
      <span></span>;
  }
});
