// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

'use strict';

var React = require('react');
var update = require('react-addons-update');

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

module.exports = React.createClass({

  displayName: 'Object',

  mixins: [require('../../mixins/field')],

  getInitialState: function getInitialState() {
    var config = this.props.config;
    return {
      assocList: config.objectToAssocList(this.props.field.value)
    };
  },

  orderedAssocList: function orderedAssocList(props) {
    var _this = this;

    var config = this.props.config;
    var newAssocList = config.objectToAssocList(props.field.value);

    // If we have an existing key order, use that.
    if (this.keyOrder) {
      var _ret = (function () {
        var keyToItem = newAssocList.reduce(function (obj, item) {
          obj[item.key] = item;
          return obj;
        }, {});
        var keyOrderSet = _this.keyOrder.reduce(function (obj, key) {
          obj[key] = true;
          return obj;
        }, {});
        // Make a list in order of old keys.
        var orderedAssocList = _this.keyOrder.reduce(function (list, key) {
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
        return {
          v: orderedAssocList
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
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
      var field = update(this.props.field, {
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
    var field = update(this.props.field, {
      value: { $set: this.state.assocList },
      type: { $set: 'assoc-list' }
    });

    return config.createElement('assoc-list', {
      field: field, onChange: this.onChange, onAction: this.onBubbleAction
    });
  }
});