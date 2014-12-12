// # component.list-item-value

/*
Render the value of a list item.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ListItemValue',

  mixins: [require('../../mixins/config')],

  onChangeField: function (newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;
    var value = this.props.value;

    return R.div({className: cx(this.props.classes)},

      config.createField({field: field, value: value, onChange: this.onChangeField, onFocus: this.props.onFocus, onBlur: this.props.onBlur})
    );
  }
});
