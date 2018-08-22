// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _field = require('../../mixins/field');

var _field2 = _interopRequireDefault(_field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasDuplicateKeys = function hasDuplicateKeys(assocList) {
  var hasDups = false;
  var keys = {};

  assocList.forEach(function (row) {
    if (keys[row.key]) {
      hasDups = true;
      return;
    }
    keys[row.key] = true;
  });

  return hasDups;
};

exports.default = (0, _createReactClass2.default)({

  displayName: 'Object',

  mixins: [_field2.default],

  getInitialState: function getInitialState() {
    var config = this.props.config;
    return {
      assocList: config.objectToAssocList(this.props.field.value)
    };
  },
  orderedAssocList: function orderedAssocList(props) {
    var config = this.props.config;
    var newAssocList = config.objectToAssocList(props.field.value);

    // If we have an existing key order, use that.
    if (this.keyOrder) {
      var keyToItem = newAssocList.reduce(function (obj, item) {
        obj[item.key] = item;
        return obj;
      }, {});
      var keyOrderSet = this.keyOrder.reduce(function (obj, key) {
        obj[key] = true;
        return obj;
      }, {});
      // Make a list in order of old keys.
      var orderedAssocList = this.keyOrder.reduce(function (list, key) {
        if (key in keyToItem) {
          list.push(keyToItem[key]);
        }
        return list;
      }, []);
      // Add any new keys at the end.
      newAssocList.reduce(function (list, item) {
        if (!(item.key in keyOrderSet)) {
          list.push(item);
        }
        return list;
      }, orderedAssocList);
      return orderedAssocList;
    }
    return newAssocList;
  },
  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (hasDuplicateKeys(this.state.assocList)) {
      return; // talk to the hand
    }
    var newAssocList = this.orderedAssocList(newProps);
    this.keyOrder = newAssocList.map(function (item) {
      return item.key;
    });
    this.setState({
      assocList: newAssocList
    });
  },
  onChange: function onChange(assocList) {
    var config = this.props.config;
    var value = config.assocListToObject(assocList);
    // Need to hold onto keys to compare when receiving props.
    this.keyOrder = assocList.map(function (item) {
      return item.key;
    });
    this.setState({ assocList: assocList });
    if (!hasDuplicateKeys(assocList)) {
      var field = (0, _immutabilityHelper2.default)(this.props.field, {
        value: { $set: value }
      });
      this.onBubbleValue(value, { field: field });
    }
  },
  render: function render() {
    return this.renderWithConfig();
  },
  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = (0, _immutabilityHelper2.default)(this.props.field, {
      value: { $set: this.state.assocList },
      type: { $set: 'assoc-list' }
    });

    return config.createElement('assoc-list', {
      field: field, onChange: this.onChange, onAction: this.onBubbleAction
    });
  }
});