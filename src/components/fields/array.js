// # array component

/*
Render a field to edit array values.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'Array',

  mixins: [FieldMixin],

  nextLookupId: 0,

  getInitialState: function() {
    // Need to create artificial keys for the array. Indexes are not good keys,
    // since they change. So, map each position to an artificial key
    const lookups = [];

    let items = this.props.field.value;
    if (!Array.isArray(items)) {
      if (items !== null && items !== undefined) {
        items = [items];
      } else {
        items = [];
      }
    }

    items.forEach(
      function(item, i) {
        lookups[i] = '_' + this.nextLookupId;
        this.nextLookupId++;
      }.bind(this)
    );

    return {
      lookups,
    };
  },

  componentWillReceiveProps: function(newProps) {
    const lookups = this.state.lookups;

    const items = newProps.field.value;

    // Need to set artificial keys for new array items.
    if (items.length > lookups.length) {
      for (let i = lookups.length; i < items.length; i++) {
        lookups[i] = '_' + this.nextLookupId;
        this.nextLookupId++;
      }
    }

    this.setState({
      lookups,
    });
  },

  onChange: function(i, newValue, info) {
    const newArrayValue = this.props.field.value.slice(0);
    newArrayValue[i] = newValue;
    this.onBubbleValue(newArrayValue, info);
  },

  onAppend: function(itemChoiceIndex) {
    const config = this.props.config;
    const field = this.props.field;

    const newValue = config.createNewChildFieldValue(field, itemChoiceIndex);

    let items = field.value;

    items = items.concat(newValue);

    this.onChangeValue(items);
  },

  onRemove: function(i) {
    const lookups = this.state.lookups;
    lookups.splice(i, 1);
    this.setState({
      lookups,
    });
    const newItems = this.props.field.value.slice(0);
    newItems.splice(i, 1);
    this.onChangeValue(newItems);
  },

  onMove: function(fromIndex, toIndex) {
    const lookups = this.state.lookups;
    const fromId = lookups[fromIndex];
    const toId = lookups[toIndex];
    lookups[fromIndex] = toId;
    lookups[toIndex] = fromId;
    this.setState({
      lookups,
    });

    const newItems = this.props.field.value.slice(0);
    if (
      fromIndex !== toIndex &&
      fromIndex >= 0 &&
      fromIndex < newItems.length &&
      toIndex >= 0 &&
      toIndex < newItems.length
    ) {
      newItems.splice(toIndex, 0, newItems.splice(fromIndex, 1)[0]);
    }
    this.onChangeValue(newItems);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;

    const fields = config.createChildFields(field);

    const arrayControl =
      !config.fieldIsReadOnly(field) &&
      config.createElement('array-control', {
        typeName: 'Array',
        field,
        id: this.state.id,
        onAppend: this.onAppend,
      });

    const tabIndex = this.isReadOnly() ? null : this.props.tabIndex || 0;

    const numItems = field.value.length;

    const arrayItemElements = config.cssTransitionWrapper(
      fields.map((childField, i) => {
        return config.createElement('array-item', {
          parentTypeName: 'Array',
          key: this.state.lookups[i],
          field: childField,
          index: i,
          numItems,
          onMove: this.onMove,
          onRemove: this.onRemove,
          onChange: this.onChange,
          onAction: this.onBubbleAction,
        });
      })
    );

    return config.createElement(
      'field',
      {
        typeName: 'Array',
        field,
        id: this.state.id,
        plain: this.props.plain,
      },
      <div
        className={cx(this.props.classes)}
        renderWith={this.renderWith('FieldBody')}
        tabIndex={tabIndex}
      >
        {arrayItemElements}
        {arrayControl}
      </div>
    );
  },
});
