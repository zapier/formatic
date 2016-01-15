// # object component

/*
Render a field to edit a array of key / value objects, where duplicate keys are allowed.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');
var update = require('react-addons-update');

var keyCountsByKey = function keyCountsByKey(assocList) {
  var counts = {};
  assocList.forEach(function (row) {
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

  getNextLookupId: function getNextLookupId() {
    return '_' + this.nextLookupId++;
  },

  getInitialState: function getInitialState() {
    var _this = this;

    var field = this.props.field;

    // maintain artificial keys, keyed by row index, to have persistent key
    var lookups = [];
    field.value.forEach(function (row, i) {
      lookups[i] = _this.getNextLookupId();
    });

    return { lookups: lookups };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    var rows = newProps.field.value;

    // set artificial keys for new rows
    if (rows.length > this.state.lookups.length) {
      var lookupsToPush = [];
      for (var i = this.state.lookups.length; i < rows.length; i++) {
        lookupsToPush.push(this.getNextLookupId());
      }
      var lookups = update(this.state.lookups, {
        $push: lookupsToPush
      });
      this.setState({ lookups: lookups });
    }
  },

  onChange: function onChange(index, newValue) {
    var field = this.props.field;

    var updatedRow = { key: field.value[index].key, value: newValue };
    var rows = update(field.value, {
      $splice: [[index, 1, updatedRow]]
    });

    // this.onBubbleValue(rows, info);
    this.onChangeValue(rows);
  },

  onAppend: function onAppend() {
    var field = this.props.field;

    var newRow = { key: '', value: '' };
    var rows = update(field.value, {
      $push: [newRow]
    });

    // componentWillReceiveProps will add the new artificial key to lookups
    this.onChangeValue(rows);
  },

  onRemove: function onRemove(index) {
    var field = this.props.field;

    // componentWillReceiveProps can't know which item was deleted, so
    // put new artificial key in lookups here
    var lookups = update(this.state.lookups, {
      $splice: [[index, 1]]
    });
    this.setState({ lookups: lookups });

    var rows = update(field.value, {
      $splice: [[index, 1]]
    });
    this.onChangeValue(rows);
  },

  onChangeKey: function onChangeKey(index, newKey) {
    var field = this.props.field;

    var updatedRow = { key: newKey, value: field.value[index].value };
    var rows = update(field.value, {
      $splice: [[index, 1, updatedRow]]
    });

    this.onChangeValue(rows);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var fields = config.createChildFields(field);
    var keyCounts = keyCountsByKey(field.value);

    return config.createElement('field', {
      field: field, plain: this.props.plain
    }, R.div({ className: cx(this.props.classes) }, config.cssTransitionWrapper(field.value.map((function (row, i) {
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
    }).bind(this))), config.createElement('assoc-list-control', { field: field, onAppend: this.onAppend })));
  }
});