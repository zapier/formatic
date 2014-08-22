'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({

  mixins: [require('./mixins/input-actions')],

  render: function () {

    var choices = this.props.field.choices;

    if (!this.props.field.value) {
      choices = [{
        value: '',
        label: ''
      }].concat(choices);
    }

    return R.select({
      onChange: this.onChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      name: this.props.field.key,
      value: this.props.field.value //,
      //onFocus: this.props.actions.focus
    },
      choices.map(function (choice) {
        return R.option({
          value: choice.value
        }, choice.label);
      }.bind(this))
    );
  }
});
