// # component.string

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Unicode',

  mixins: [require('../../mixins/field')],

  // getDefaultProps: function () {
  //   return {
  //     className: plugin.config.className,
  //     rows: plugin.config.rows || 5
  //   };
  // },

  onChange: function (event) {
    //this.props.config.onChange(event.target.value, this.props.field, this.props.onChange);
    this.onChangeValue(event.target.value);
  },

  render: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, R.input({
      type: 'text',
      value: this.props.value,
      className: cx(this.props.classes),
      onChange: this.onChange
    }));

    // var field = this.props.field;
    //
    // return plugin.component('field')({
    //   field: field, plain: this.props.plain
    // }, R.textarea({
    //   className: this.props.className,
    //   value: field.value,
    //   rows: field.def.rows || this.props.rows,
    //   onChange: this.onChange,
    //   onFocus: this.onFocus,
    //   onBlur: this.onBlur
    // }));
  }
});
