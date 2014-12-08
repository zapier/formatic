'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = React.createClass({

  displayName: 'StaticObjectField',

  onChangeField: function (newValue, info) {
    var newObjectValue = _.extend({}, this.props.value);
    newObjectValue[info.field.key] = newValue;
    this.props.onChange(newObjectValue, {
      field: this.props.field,
      fields: [this.props.field].concat(info.fields)
    });
  },


  render: function () {
    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    },
      R.fieldset({className: this.props.className},
        field.fields.map(function (field, i) {
          return config.createField({config: config, key: field.key || i, field: field, onChange: this.onChangeField, onFocus: this.props.onFocus, onBlur: this.props.onBlur});
        }.bind(this))
      )
    );
  }

});
