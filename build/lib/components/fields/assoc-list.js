// # object component

/*
Render a field to edit a array of key / value objects, where duplicate keys are allowed.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _field = require('../../mixins/field');

var _field2 = _interopRequireDefault(_field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

exports.default = (0, _createReactClass2.default)({

  displayName: 'AssocList',

  mixins: [_field2.default],

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
      var lookups = (0, _immutabilityHelper2.default)(this.state.lookups, {
        $push: lookupsToPush
      });
      this.setState({ lookups: lookups });
    }
  },
  onChange: function onChange(index, newValue) {
    var field = this.props.field;

    var updatedRow = { key: field.value[index].key, value: newValue };
    var rows = (0, _immutabilityHelper2.default)(field.value, {
      $splice: [[index, 1, updatedRow]]
    });

    // this.onBubbleValue(rows, info);
    this.onChangeValue(rows);
  },
  onAppend: function onAppend() {
    var field = this.props.field;

    var newRow = { key: '', value: '' };
    var rows = (0, _immutabilityHelper2.default)(field.value, {
      $push: [newRow]
    });

    // componentWillReceiveProps will add the new artificial key to lookups
    this.onChangeValue(rows);
  },
  onRemove: function onRemove(index) {
    var field = this.props.field;

    // componentWillReceiveProps can't know which item was deleted, so
    // put new artificial key in lookups here
    var lookups = (0, _immutabilityHelper2.default)(this.state.lookups, {
      $splice: [[index, 1]]
    });
    this.setState({ lookups: lookups });

    var rows = (0, _immutabilityHelper2.default)(field.value, {
      $splice: [[index, 1]]
    });
    this.onChangeValue(rows);
  },
  onChangeKey: function onChangeKey(index, newKey) {
    var field = this.props.field;

    var updatedRow = { key: newKey, value: field.value[index].value };
    var rows = (0, _immutabilityHelper2.default)(field.value, {
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

    var content = config.cssTransitionWrapper(field.value.map(function (row, i) {
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
    }.bind(this)));

    var assocList = config.createElement('assoc-list-control', {
      field: field,
      onAppend: this.onAppend
    });

    return config.createElement('field', {
      field: field,
      plain: this.props.plain
    }, _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)(this.props.classes) },
      content,
      assocList
    ));
  }
});