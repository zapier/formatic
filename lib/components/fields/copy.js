'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Copy',

  render: function () {

    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.classes)},
      config.fieldHelpText(field)
    );
  }
});
