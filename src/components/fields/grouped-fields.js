// # fields component

/*
Render a fields in groups. Grouped by field.groupKey property.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '@/src/undash';
import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

const groupFields = function(fields, humanize) {
  const groupedFields = [];

  fields.forEach(function(field) {
    if (field.groupKey) {
      let group = _.find(groupedFields, function(g) {
        return g.isGroup && field.groupKey === g.key;
      });

      if (!group) {
        group = {
          key: field.groupKey,
          label: field.groupLabel || humanize(field.groupKey),
          children: [],
          isGroup: true,
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

export default createReactClass({
  displayName: 'GroupedFields',

  mixins: [FieldMixin],

  onChangeField: function(key, newValue, info) {
    if (key) {
      const newObjectValue = _.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  renderFields: function(fields, groupKey, groupLabel) {
    const config = this.props.config;
    const self = this;

    const childFields = fields.map(function(fieldOrGroup) {
      if (fieldOrGroup.isGroup) {
        return self.renderFields(
          fieldOrGroup.children,
          fieldOrGroup.key,
          fieldOrGroup.label
        );
      }

      const key = fieldOrGroup.key;
      return config.createFieldElement({
        key,
        field: fieldOrGroup,
        onChange: self.onChangeField.bind(self, key),
        onAction: self.onBubbleAction,
      });
    });

    let legend;
    let className = cx(this.props.classes);

    if (groupLabel) {
      legend = (
        <legend renderWith={this.renderWith('Label')}>{groupLabel}</legend>
      );
      className += ' child-fields-group';
    }

    return (
      <fieldset
        className={className}
        key={groupKey}
        renderWith={this.renderWith('FieldBody')}
      >
        {legend}
        {childFields}
      </fieldset>
    );
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const fields = groupFields(
      config.createChildFields(field),
      config.humanize
    );

    return config.createElement(
      'field',
      {
        typeName: 'GroupedFields',
        config,
        field,
        plain: this.props.plain,
      },
      this.renderFields(fields)
    );
  },
});
