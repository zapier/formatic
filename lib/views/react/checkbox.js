'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (formatic, config) {

  var view = React.createClass({

    onFocus: function () {
      this.props.form.actions.focus(this.props.field);
    },

    onBlur: function () {
      this.props.form.actions.blur(this.props.field);
    },

    onChange: function () {
      var choiceNodes = this.refs.choices.getDOMNode().getElementsByTagName('input');
      choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
      var values = choiceNodes.map(function (node) {
        return node.checked ? node.value : null;
      }).filter(function (value) {
        return value;
      });
      this.props.form.actions.change(this.props.field, values);
    },

    render: function () {

      return R.div({className: 'field-choices', ref: 'choices'},
        this.props.field.choices.map(function (choice) {
          return R.span({className: 'field-choice'},
            R.input({
              name: this.props.field.key,
              type: 'checkbox',
              value: choice.value,
              checked: this.props.field.value.indexOf(choice.value) >= 0 ? true : false,
              onChange: this.onChange,
              onFocus: this.onFocus,
              onBlur: this.onBlur
              //onFocus: this.props.actions.focus
            }),
            R.span({className: 'field-choice-label'},
              choice.label
            )
          );
        }.bind(this))
      );
    }
  });

  formatic.view(config.type, view);
};
