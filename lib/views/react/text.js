'use strict';

var React = require('react');
var R = React.DOM;

var Field = require('./field');

module.exports = React.createClass({

  mixins: [require('./mixins/input-actions')],

  render: function () {

    var field = this.props.field;

    return Field({field: field},
      R.input({
        type: field.type,
        name: field.key,
        value: field.value,
        onChange: this.onChange,
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        readOnly: field.isReadOnly
      })
    );
  }
});
