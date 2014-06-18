'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({

  render: function () {
    return R.div({},
      R.label({},
        this.props.field.label
      ),
      R.input({
        type: 'text',
        value: this.props.field.value,
        onChange: this.props.onChange
      })
    );
  }
});
