// # fields component

/*
Render a fields in groups. Grouped by field.groupKey property.
*/

'use strict';

var React = require('react/addons');
var _ = require('../../undash');
var cx = require('classnames');

var groupFields = function groupFields(fields, humanize) {
  var groupedFields = [];

  fields.forEach(function (field) {
    if (field.groupKey) {
      var group = _.find(groupedFields, function (g) {
        return g.isGroup && field.groupKey === g.key;
      });

      if (!group) {
        group = {
          key: field.groupKey,
          label: field.groupLabel || humanize(field.groupKey),
          children: [],
          isGroup: true
        };
        groupedFields.push(group);
      }

      group.children.push(field);
    } else {
      groupedFields.push(field); // top level field
    }
  });

  return groupedFields;
};

module.exports = React.createClass({

  displayName: 'GroupedFields',

  mixins: [require('../../mixins/field')],

  onChangeField: function onChangeField(key, newValue, info) {
    if (key) {
      var newObjectValue = _.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  renderFields: function renderFields(fields, groupKey, groupLabel) {
    var config = this.props.config;
    var self = this;

    var childFields = fields.map(function (fieldOrGroup) {
      if (fieldOrGroup.isGroup) {
        return self.renderFields(fieldOrGroup.children, fieldOrGroup.key, fieldOrGroup.label);
      }

      var key = fieldOrGroup.key;
      return config.createFieldElement({
        key: key,
        field: fieldOrGroup,
        onChange: self.onChangeField.bind(self, key),
        onAction: self.onBubbleAction
      });
    });

    var legend;
    var className = cx(this.props.classes);

    if (groupLabel) {
      legend = React.createElement(
        'legend',
        null,
        groupLabel
      );
      className += ' child-fields-group';
    }

    return React.createElement(
      'fieldset',
      { key: groupKey, className: className },
      legend,
      childFields
    );
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fields = groupFields(config.createChildFields(field), config.humanize);

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, this.renderFields(fields));
  }

});