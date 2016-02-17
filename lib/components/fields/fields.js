// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('../../undash');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'Fields',

  mixins: [require('../../mixins/field')],

  onChangeField: function (key, newValue, info) {
    if (!key) {
      const parentPath = this.props.config.fieldValuePath(this.props.field);
      const childPath = this.props.config.fieldValuePath(info.field).slice(parentPath.length);
      key = childPath[0];
      if (key) {
        newValue = newValue[key];
      }
    }
    if (key) {
      var newObjectValue = _.extend({}, this.props.field.value);
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

    var fields = config.createChildFields(field);

    // Want to move to fieldset with legend, but doing a little backward-compatible
    // hacking here, only converting child `fields` without keys.
    var isGroup = !!(field.parent && !field.key);

    var classes = _.extend({}, this.props.classes);

    if (isGroup) {
      classes['child-fields-group'] = true;
    }

    return config.createElement('field', {
      config: config, field: field, plain: isGroup || this.props.plain
    },
      R.fieldset({className: cx(classes)},
        isGroup ? <legend>{config.fieldLabel(field)}</legend> : null,
        isGroup ? (
          config.createElement('help', {
            config: config, field: field
          })
        ) : null,
        fields.map(function (childField, i) {
          var key = childField.key || i;
          return config.createFieldElement({
            key: key || i,
            field: childField,
            onChange: this.onChangeField.bind(this, childField.key), onAction: this.onBubbleAction
          });
        }.bind(this))
      )
    );
  }

});
