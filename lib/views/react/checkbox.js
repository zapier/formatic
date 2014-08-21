'use strict';

var React = require('react');
var R = React.DOM;

var Field = require('./field');

module.exports = React.createClass({

  onChange: function () {
    var choiceNodes = this.refs.choices.getDOMNode().getElementsByTagName('input');
    choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
    var values = choiceNodes.map(function (node) {
      return node.checked ? node.value : null;
    }).filter(function (value) {
      return value;
    });
    this.props.onChange(values);
  },

  render: function () {

    return Field({field: this.props.field},
      R.div({className: 'field-choices', ref: 'choices'},
        this.props.field.choices.map(function (choice) {
          return R.span({className: 'field-choice'},
            R.input({
              name: this.props.field.key,
              type: 'checkbox',
              value: choice.value,
              checked: this.props.field.value.indexOf(choice.value) >= 0 ? true : false,
              onChange: this.onChange,
              onFocus: this.props.action('focus')
            }),
            R.span({className: 'field-choice-label'},
              choice.label
            )
          );
        }.bind(this))
      )
    );
  }
});
