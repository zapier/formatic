'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({

  onChange: function () {
    this.props.onChange(this.refs.input.getDOMNode().checked);
  },

  render: function () {

    return R.div({className: 'field checkbox-boolean-field'},
      R.input({
        name: this.props.field.key,
        type: 'checkbox',
        checked: this.props.field.value ? true : false,
        onChange: this.onChange,
        ref: 'input'
      }),
      R.label({},
        this.props.field.label
      )
    );
  }
});
