// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '../../undash';
import FieldMixin from '../../mixins/field';

/** @jsx jsx */
import jsx from '../../jsx';

export default createReactClass({
  displayName: 'Fields',

  mixins: [FieldMixin],

  onChangeField: function(key, newValue, info) {
    if (!key) {
      const parentPath = this.props.config.fieldValuePath(this.props.field);
      const childPath = this.props.config
        .fieldValuePath(info.field)
        .slice(parentPath.length);
      key = childPath[0];
      if (key) {
        newValue = newValue[key];
      }
    }
    if (key) {
      const newObjectValue = _.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const fields = config.createChildFields(field);

    // Want to move to fieldset with legend, but doing a little backward-compatible
    // hacking here, only converting child `fields` without keys.
    const isGroup = !!(field.parent && (field.key === '' || field.key == null));

    const classes = _.extend({}, this.props.classes);

    if (isGroup) {
      classes['child-fields-group'] = true;
    }

    const legend = !isGroup ? null : (
      <legend>{config.fieldLabel(field)}</legend>
    );

    const help = !isGroup
      ? null
      : config.createElement('help', {
          config,
          field,
        });

    const content = fields.map(
      function(childField, i) {
        const key = childField.key || i;
        return config.createFieldElement({
          key: key || i,
          field: childField,
          onChange: this.onChangeField.bind(this, childField.key),
          onAction: this.onBubbleAction,
        });
      }.bind(this)
    );

    return config.createElement(
      'field',
      {
        config,
        field,
        plain: isGroup || this.props.plain,
      },
      <fieldset
        renderWith={this.renderWith('FieldBody')}
        className={cx(classes)}
      >
        {legend}
        {help}
        {content}
      </fieldset>
    );
  },
});
