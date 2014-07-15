'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({

  render: function () {
    return R.form({className: 'zf-form'},
      this.props.field.fields.map(function (field) {
        return this.props.form.component(field);
      }.bind(this))
    );
  }
});
