'use strict';

var React = require('react/addons');
var R = React.DOM;

module.exports = React.createClass({

  displayName: 'Copy',

  render: function () {

    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: this.props.className},
      config.getFieldHelpText(field)
    );
  }
});
