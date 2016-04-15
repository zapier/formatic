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

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    var _this = this;

    if (hasDuplicateKeys(this.state.assocList)) {
      return; // talk to the hand
    }
    var config = this.props.config;
    var newAssocList = config.objectToAssocList(newProps.field.value);
    // If we came from an onChange, use the previous sort order for keys.
    if (this.keysBeforeChange) {
      (function () {
        var keyToItem = newAssocList.reduce(function (obj, item) {
          obj[item.key] = item;
          return obj;
        }, {});
        var keysBeforeChangeSet = _this.keysBeforeChange.reduce(function (obj, key) {
          obj[key] = true;
          return obj;
        }, {});
        // Make a list in order of old keys.
        var orderedAssocList = _this.keysBeforeChange.reduce(function (list, key) {
          list.push(keyToItem[key]);
          return list;
        }, []);
        // Add any new keys at the end.
        newAssocList.reduce(function (list, item) {
          if (!(item.key in keysBeforeChangeSet)) {
            list.push(item);
          }
          return list;
        }, orderedAssocList);
        _this.setState({
          assocList: orderedAssocList
        });
      })();
    } else {
      this.setState({
        assocList: newAssocList
      });
    }
    this.keysBeforeChange = null;
  },

  onChange: function onChange(assocList) {
    var config = this.props.config;
    var value = config.assocListToObject(assocList);
    var keys = assocList.map(function (item) {
      return item.key;
    });
    // Need to hold onto keys to compare when receiving props.
    this.keysBeforeChange = keys;
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