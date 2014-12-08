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

    var field = this.props.field;

    return field.helpText ?
      R.div({className: this.props.className},
        field.helpText
      ) :
      R.span(null);
  }
});
