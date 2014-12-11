// # component.help

/*
Just the help text block.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;

module.exports = React.createClass({

  displayName: 'Help',

  render: function () {

    var config = this.props.config;
    var field = this.props.field;
    var helpText = config.getFieldHelpText(field);

    return helpText ?
      R.div({className: this.props.className, dangerouslySetInnerHTML: {__html: helpText}}) :
      R.span(null);
  }
});
