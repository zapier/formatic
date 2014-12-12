// # component.object

/*
Render an object.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

var tempKeyPrefix = '$$__temp__';

var tempKey = function (id) {
  return tempKeyPrefix + id;
};

var isTempKey = function (key) {
  return key.substring(0, tempKeyPrefix.length) === tempKeyPrefix;
};

module.exports = React.createClass({

  displayName: 'Object',

  mixins: [require('../../mixins/field')],

  nextLookupId: 0,

  getInitialState: function () {

    var keyToId = {};
    var fields = this.props.field.fields();
    var keyToField = {};
    var keyOrder = [];

    // Keys don't make good react keys, since we're allowing them to be
    // changed here, so we'll have to create fake keys and
    // keep track of the mapping of real keys to fake keys. Yuck.
    fields.forEach(function (field) {
      this.nextLookupId++;
      keyToId[field.def.key] = this.nextLookupId;
      keyToField[field.def.key] = field;
      keyOrder.push(field.def.key);
    }.bind(this));

    return {
      keyToId: keyToId,
      keyToField: keyToField,
      keyOrder: keyOrder,
      tempKeys: {}
    };
  },

  componentWillReceiveProps: function (newProps) {

    var keyToId = this.state.keyToId;
    var newKeyToId = {};
    var newKeyToField = {};
    var tempKeys = this.state.tempKeys;
    var newTempKeys = {};
    var keyOrder = this.state.keyOrder;
    var fields = newProps.field.fields();
    var addedKeys = [];

    // Look at the new fields.
    fields.forEach(function (field) {
      // Add new lookup if this key wasn't here last time.
      if (!keyToId[field.def.key]) {
        this.nextLookupId++;
        newKeyToId[field.def.key] = this.nextLookupId;
        addedKeys.push(field.def.key);
      } else {
        newKeyToId[field.def.key] = keyToId[field.def.key];
      }
      newKeyToField[field.def.key] = field;
      if (isTempKey(field.def.key) && newKeyToId[field.def.key] in tempKeys) {
        newTempKeys[newKeyToId[field.def.key]] = tempKeys[newKeyToId[field.def.key]];
      }
    }.bind(this));

    var newKeyOrder = [];

    // Look at the old fields.
    keyOrder.forEach(function (key) {
      if (newKeyToField[key]) {
        newKeyOrder.push(key);
      }
    });

    // Put added fields at the end. (So things don't get shuffled.)
    newKeyOrder = newKeyOrder.concat(addedKeys);

    this.setState({
      keyToId: newKeyToId,
      keyToField: newKeyToField,
      keyOrder: newKeyOrder,
      tempKeys: newTempKeys
    });
  },

  onAppend: function (itemIndex) {
    this.nextLookupId++;

    var keyToId = this.state.keyToId;
    var keyOrder = this.state.keyOrder;
    var tempKeys = this.state.tempKeys;

    var id = this.nextLookupId;
    var newKey = tempKey(id);

    keyToId[newKey] = id;
    tempKeys[id] = '';
    keyOrder.push(newKey);

    this.setState({
      keyToId: keyToId,
      tempKeys: tempKeys,
      keyOrder: keyOrder
    });

    this.props.field.append(itemIndex, newKey);
  },

  onRemove: function (key) {
    this.props.field.remove(key);
  },

  onMove: function (fromKey, toKey) {
    if (fromKey !== toKey) {
      var keyToId = this.state.keyToId;
      var keyOrder = this.state.keyOrder;
      var tempKeys = this.state.tempKeys;

      if (keyToId[toKey]) {
        var tempToKey = tempKey(keyToId[toKey]);
        tempKeys[keyToId[toKey]] = toKey;
        keyToId[tempToKey] = keyToId[toKey];
        keyOrder[keyOrder.indexOf(toKey)] = tempToKey;
        delete keyToId[toKey];
        this.setState({
          keyToId: keyToId,
          tempKeys: tempKeys,
          keyOrder: keyOrder
        });
        this.props.field.move(toKey, tempToKey);
      }

      if (!toKey) {
        toKey = tempKey(keyToId[fromKey]);
        tempKeys[keyToId[fromKey]] = '';
      }
      keyToId[toKey] = keyToId[fromKey];
      keyOrder[keyOrder.indexOf(fromKey)] = toKey;

      this.setState({
        keyToId: keyToId,
        keyOrder: keyOrder
      });

      this.props.field.move(fromKey, toKey);
    }
  },

  render: function () {

    var config = this.props.config;
    var field = this.props.field;
    var fields = this.state.keyOrder.map(function (key) {
      return this.state.keyToField[key];
    }.bind(this));

    return config.createElement('field', {
      field: field, plain: this.props.plain
    },
      R.div({className: this.props.className},
        CSSTransitionGroup({transitionName: 'reveal'},
          fields.map(function (child) {
            return config.createElement('object-item', {
              key: this.state.keyToId[child.def.key],
              form: this.props.form,
              field: child,
              parent: field,
              onMove: this.onMove,
              onRemove: this.onRemove,
              tempKey: this.state.tempKeys[this.state.keyToId[child.def.key]]
            });
          }.bind(this))
        ),
        config.createElement('object-control', {field: field, onAppend: this.onAppend})
      )
    );
  }
});
