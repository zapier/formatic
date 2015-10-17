'use strict';

var React = require('react');
var _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'FieldContainer',

  onChange: function onChange(fieldKey, value) {
    var onChange = this.props.onChange;

    onChange(event.target.value);
  },

  render: function render() {
    var children = this.props.children;

    if (_.isFunction(children)) {
      return children({ onChange: this.onChange });
    }
    return null;
  }
});