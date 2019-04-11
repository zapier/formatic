// # object component

/*
Render a field to edit a array of key / value objects, where duplicate keys are allowed.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';
import update from 'immutability-helper';

import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

const keyCountsByKey = assocList => {
  const counts = {};
  assocList.forEach(row => {
    if (!counts[row.key]) {
      counts[row.key] = 0;
    }
    counts[row.key] += 1;
  });
  return counts;
};

export default createReactClass({
  displayName: 'AssocList',

  mixins: [FieldMixin],

  nextLookupId: 0,

  getNextLookupId() {
    return '_' + this.nextLookupId++;
  },

  getInitialState() {
    const field = this.props.field;

    // maintain artificial keys, keyed by row index, to have persistent key
    const lookups = [];
    field.value.forEach((row, i) => {
      lookups[i] = this.getNextLookupId();
    });

    return { lookups };
  },

  componentWillReceiveProps(newProps) {
    const rows = newProps.field.value;

    // set artificial keys for new rows
    if (rows.length > this.state.lookups.length) {
      const lookupsToPush = [];
      for (let i = this.state.lookups.length; i < rows.length; i++) {
        lookupsToPush.push(this.getNextLookupId());
      }
      const lookups = update(this.state.lookups, {
        $push: lookupsToPush,
      });
      this.setState({ lookups });
    }
  },

  onChange(index, newValue) {
    const field = this.props.field;

    const updatedRow = { key: field.value[index].key, value: newValue };
    const rows = update(field.value, {
      $splice: [[index, 1, updatedRow]],
    });

    // this.onBubbleValue(rows, info);
    this.onChangeValue(rows);
  },

  onAppend() {
    const field = this.props.field;

    const newRow = { key: '', value: '' };
    const rows = update(field.value, {
      $push: [newRow],
    });

    // componentWillReceiveProps will add the new artificial key to lookups
    this.onChangeValue(rows);
  },

  onRemove(index) {
    const field = this.props.field;

    // componentWillReceiveProps can't know which item was deleted, so
    // put new artificial key in lookups here
    const lookups = update(this.state.lookups, {
      $splice: [[index, 1]],
    });
    this.setState({ lookups });

    const rows = update(field.value, {
      $splice: [[index, 1]],
    });
    this.onChangeValue(rows);
  },

  onChangeKey(index, newKey) {
    const field = this.props.field;

    const updatedRow = { key: newKey, value: field.value[index].value };
    const rows = update(field.value, {
      $splice: [[index, 1, updatedRow]],
    });

    this.onChangeValue(rows);
  },

  render() {
    return this.renderWithConfig();
  },

  renderDefault() {
    const config = this.props.config;
    const field = this.props.field;
    const fields = config.createChildFields(field);
    const keyCounts = keyCountsByKey(field.value);

    const content = config.cssTransitionWrapper(
      field.value.map(
        function(row, i) {
          return config.createElement('assoc-list-item', {
            parentTypeName: 'AssocList',
            key: this.state.lookups[i],
            index: i,
            displayKey: row.key,
            field: fields[i],
            id: this.state.id,
            isDuplicateKey: keyCounts[row.key] > 1,
            onChangeKey: this.onChangeKey,
            onChange: this.onChange,
            onRemove: this.onRemove,
            onAction: this.onBubbleAction,
          });
        }.bind(this)
      )
    );

    const assocList = config.createElement('assoc-list-control', {
      typeName: 'AssocList',
      field,
      onAppend: this.onAppend,
    });

    return config.createElement(
      'field',
      {
        typeName: 'AssocList',
        field,
        id: this.state.id,
        plain: this.props.plain,
      },
      <div
        className={cx(this.props.classes)}
        renderWith={this.renderWith('FieldBody')}
      >
        {content}
        {assocList}
      </div>
    );
  },
});
