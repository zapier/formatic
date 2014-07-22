'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({

  render: function () {

    var field = this.props.field;

    return R.div({key: field.key, className: 'field text-field'},
      R.label({},
        field.label
      ),
      R.input({
        type: field.type,
        name: field.key,
        value: field.value,
        onChange: this.props.onChange,
        readOnly: field.isReadOnly
      })
    );
  }
});
