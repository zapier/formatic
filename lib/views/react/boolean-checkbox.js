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
      this.props.form.actions.change(this.props.field, this.refs.input.getDOMNode().checked);
    },

    render: function () {

      return R.div({className: 'field checkbox-boolean-field'},
        R.input({
          name: this.props.field.key,
          type: 'checkbox',
          checked: this.props.field.value ? true : false,
          onChange: this.onChange,
          onFocus: this.onFocus,
          onBlur: this.onBlur,
          //onFocus: this.props.actions.focus,
          ref: 'input'
        }),
        R.label({},
          this.props.field.label
        )
      );
    }
  });

  formatic.view(config.type, view);
};
