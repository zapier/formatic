'use strict';

var React = require('react');
var R = React.DOM;

var Field = require('./field');

module.exports = React.createClass({

  render: function () {

    return Field({field: this.props.field},
      R.select({onChange: this.props.onChange, name: this.props.field.key, value: this.props.field.value},
        this.props.field.choices.map(function (choice) {
          return R.option({
            value: choice.value
          }, choice.label);
        }.bind(this))
      )
    );
  }
});
