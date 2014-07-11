'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({
  render: function () {
    return R.div({key: this.props.field.key},
      R.label({},
        this.props.field.label
      ),
      R.textarea({
        rows: 25,
        name: this.props.field.key,
        value: this.props.field.value,
        onChange: this.props.onChange
      })
    );
  }
});
