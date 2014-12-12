'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Fields',

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
    var obj = this.props.value;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    },
      R.fieldset({className: cx(this.props.classes)},
        field.fields.map(function (field, i) {
          var value;
          var key = field.key;
          if (key) {
            value = obj[key];
            if (_.isUndefined(value)) {
              value = config.fieldDefaultValue(field);
            }
          }
          return config.createField({config: config, key: field.key || i, field: field, value: value, onChange: this.onChangeField, onFocus: this.props.onFocus, onBlur: this.props.onBlur});
        }.bind(this))
      )
    );
  }

});
