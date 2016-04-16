// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

'use strict';

const React = require('react');
const update = require('react-addons-update');

const hasDuplicateKeys = assocList => {
  let hasDups = false;
  const keys = {};

  assocList.forEach(row => {
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

  getInitialState() {
    const config = this.props.config;
    return {
      assocList: config.objectToAssocList(this.props.field.value)
    };
  },

  orderedAssocList(props) {
    const config = this.props.config;
    const newAssocList = config.objectToAssocList(props.field.value);

    // If we have an existing key order, use that.
    if (this.keyOrder) {
      const keyToItem = newAssocList.reduce((obj, item) => {
        obj[item.key] = item;
        return obj;
      }, {});
      const keyOrderSet = this.keyOrder.reduce((obj, key) => {
        obj[key] = true;
        return obj;
      }, {});
      // Make a list in order of old keys.
      const orderedAssocList = this.keyOrder.reduce((list, key) => {
        if (key in keyToItem) {
          list.push(keyToItem[key]);
        }
        return list;
      }, []);
      // Add any new keys at the end.
      newAssocList.reduce((list, item) => {
        if (!(item.key in keyOrderSet)) {
          list.push(item);
        }
        return list;
      }, orderedAssocList);
      return orderedAssocList;
    }
    return newAssocList;
  },

  componentWillReceiveProps(newProps) {
    if (hasDuplicateKeys(this.state.assocList)) {
      return; // talk to the hand
    }
    const newAssocList = this.orderedAssocList(newProps);
    this.keyOrder = newAssocList.map(item => item.key);
    this.setState({
      assocList: newAssocList
    });
  },

  onChange(assocList) {
    const config = this.props.config;
    const value = config.assocListToObject(assocList);
    // Need to hold onto keys to compare when receiving props.
    this.keyOrder = assocList.map(item => item.key);
    this.setState({assocList});
    if (!hasDuplicateKeys(assocList)) {
      const field = update(this.props.field, {
        value: {$set: value}
      });
      this.onBubbleValue(value, {field});
    }
  },

  render() {
    return this.renderWithConfig();
  },

  renderDefault() {
    const config = this.props.config;
    const field = update(this.props.field, {
      value: {$set: this.state.assocList},
      type: {$set: 'assoc-list'}
    });

    return config.createElement('assoc-list', {
      field, onChange: this.onChange, onAction: this.onBubbleAction
    });
  }
});
