// # object component

/*
Render a field to edit a array of key / value objects, where duplicate keys are allowed.
*/

'use strict';

const React = require('react');
const R = React.DOM;
const cx = require('classnames');
const update = require('react-addons-update');

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

module.exports = React.createClass({

  displayName: 'AssocList',

  mixins: [require('../../mixins/field')],

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

    return {lookups};
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
        $push: lookupsToPush
      });
      this.setState({lookups});
    }
  },

  onChange(index, newValue) {
    const field = this.props.field;

    const updatedRow = {key: field.value[index].key, value: newValue};
    const rows = update(field.value, {
      $splice: [[index, 1, updatedRow]]
    });

    // this.onBubbleValue(rows, info);
    this.onChangeValue(rows);
  },

  onAppend() {
    const field = this.props.field;

    const newRow = {key: '', value: ''};
    const rows = update(field.value, {
      $push: [newRow]
    });

    // componentWillReceiveProps will add the new artificial key to lookups
    this.onChangeValue(rows);
  },

  onRemove(index) {
    const field = this.props.field;

    // componentWillReceiveProps can't know which item was deleted, so
    // put new artificial key in lookups here
    const lookups = update(this.state.lookups, {
      $splice: [[index, 1]]
    });
    this.setState({lookups});

    const rows = update(field.value, {
      $splice: [[index, 1]]
    });
    this.onChangeValue(rows);
  },

  onChangeKey(index, newKey) {
    const field = this.props.field;

    const updatedRow = {key: newKey, value: field.value[index].value};
    const rows = update(field.value, {
      $splice: [[index, 1, updatedRow]]
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

    return config.createElement('field', {
      field: field, plain: this.props.plain
    },
     R.div({className: cx(this.props.classes)},
        config.cssTransitionWrapper(
          field.value.map(function (row, i) {
            return config.createElement('assoc-list-item', {
              key: this.state.lookups[i],
              index: i,
              displayKey: row.key,
              field: fields[i],
              isDuplicateKey: keyCounts[row.key] > 1,
              onChangeKey: this.onChangeKey,
              onChange: this.onChange,
              onRemove: this.onRemove,
              onAction: this.onBubbleAction
            });
          }.bind(this))
        ),
        config.createElement('assoc-list-control', {field: field, onAppend: this.onAppend})
      )
    );
  }
});
