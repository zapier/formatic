'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

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

      var className = formatic.className(plugin.config.className, this.props.field.className);

      // return R.div({className: 'field checkbox-boolean-field'},
      //   R.input({
      //     name: this.props.field.key,
      //     type: 'checkbox',
      //     checked: this.props.field.value ? true : false,
      //     onChange: this.onChange,
      //     onFocus: this.onFocus,
      //     onBlur: this.onBlur,
      //     //onFocus: this.props.actions.focus,
      //     ref: 'input'
      //   }),
      //   R.label({},
      //     this.props.field.label
      //   )
      // );

      var props = {
        className: className,
        name: this.props.field.key,
        type: 'checkbox',
        checked: this.props.field.value ? true : false,
        onChange: this.onChange,
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        //onFocus: this.props.actions.focus,
        ref: 'input'
      };

      _.extend(props, plugin.config.attributes);

      return R.input(props);
    }
  });
};
