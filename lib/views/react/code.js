'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({

  render: function () {
    return R.pre({className: 'field code-field'},
      this.props.field.value
    );
  }
});
