'use strict';

var React = require('react/addons');
var R = React.DOM;

module.exports = React.createClass({

  displayName: 'UnknownField',

  render: function () {
    var config = this.props.config;

    return R.div({},
      R.div({}, 'Component not found for: '),
      R.pre({}, JSON.stringify(this.props.field))
    );
  }

});
