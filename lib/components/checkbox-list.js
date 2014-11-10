'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    mixins: [require('./mixins/field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onChange: function () {
      var choiceNodes = this.refs.choices.getDOMNode().getElementsByTagName('input');
      choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
      var values = choiceNodes.map(function (node) {
        return node.checked ? node.value : null;
      }).filter(function (value) {
        return value;
      });
      this.props.field.val(values);
    },

    render: function () {

      var field = this.props.field;

      var choices = field.def.choices || [];

      var value = field.value || [];

      return plugin.component('field')({
        field: field
      },
        R.div({className: this.props.className, ref: 'choices'},
          choices.map(function (choice, i) {
            return R.span({key: i, className: 'field-choice'},
              R.span({style: {whiteSpace: 'nowrap'}},
                R.input({
                  name: field.def.key,
                  type: 'checkbox',
                  value: choice.value,
                  checked: value.indexOf(choice.value) >= 0 ? true : false,
                  onChange: this.onChange
                  //onFocus: this.props.actions.focus
                }),
                R.span({className: 'field-choice-label'},
                  choice.label
                )
              ),
              ' '
            );
          }.bind(this))
        )
      );
    }
  });
};
