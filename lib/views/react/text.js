'use strict';

var React = require('react');
var R = React.DOM;

var Field = require('./field');

module.exports = React.createClass({

  render: function () {

    var field = this.props.field;

    return Field({field: field},
      R.input({
        type: field.type,
        name: field.key,
        value: field.value,
        onChange: this.props.onChange,
        onFocus: this.props.action('focus'),
        readOnly: field.isReadOnly
      })
    );
  }
});
