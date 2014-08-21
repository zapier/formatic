'use strict';

var React = require('react');
var R = React.DOM;

var Field = require('./field');

module.exports = React.createClass({

  render: function () {

    var choices = this.props.field.choices;

    if (!this.props.field.value) {
      choices = [{
        value: '',
        label: ''
      }].concat(choices);
    }

    return Field({field: this.props.field},
      R.select({
        onChange: this.props.onChange,
        name: this.props.field.key,
        value: this.props.field.value,
        onFocus: this.props.action('focus')
      },
        choices.map(function (choice) {
          return R.option({
            value: choice.value
          }, choice.label);
        }.bind(this))
      )
    );
  }
});
