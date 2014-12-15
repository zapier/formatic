'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Fields',

  mixins: [require('../../mixins/field')],

  onChangeField: function (key, newValue, info) {
    if (key) {
      var newObjectValue = _.extend({}, this.props.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;
    var obj = this.props.value;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    },
      R.fieldset({className: cx(this.props.classes)},
        field.fields.map(function (field, i) {
          var value;
          var key = config.fieldKey(field);
          if (key) {
            value = obj[key];
            if (_.isUndefined(value)) {
              value = config.fieldDefaultValue(field);
            }
          }
          return config.createField({config: config, key: key || i, field: field, value: value, onChange: this.onChangeField.bind(this, key), onAction: this.onBubbleAction});
        }.bind(this))
      )
    );
  }

});
