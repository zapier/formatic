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

  componentWillReceiveProps(newProps) {
    if (hasDuplicateKeys(this.state.assocList)) {
      return; // talk to the hand
    }
    const config = this.props.config;
    const newAssocList = config.objectToAssocList(newProps.field.value);
    // If we came from an onChange, use the previous sort order for keys.
    if (this.keysBeforeChange) {
      const keyToItem = newAssocList.reduce((obj, item) => {
        obj[item.key] = item;
        return obj;
      }, {});
      const keysBeforeChangeSet = this.keysBeforeChange.reduce((obj, key) => {
        obj[key] = true;
        return obj;
      }, {});
      // Make a list in order of old keys.
      const orderedAssocList = this.keysBeforeChange.reduce((list, key) => {
        list.push(keyToItem[key]);
        return list;
      }, []);
      // Add any new keys at the end.
      newAssocList.reduce((list, item) => {
        if (!(item.key in keysBeforeChangeSet)) {
          list.push(item);
        }
        return list;
      }, orderedAssocList);
      this.setState({
        assocList: orderedAssocList
      });
    } else {
      this.setState({
        assocList: newAssocList
      });
    }
    this.keysBeforeChange = null;
  },

  onChange(assocList) {
    const config = this.props.config;
    const value = config.assocListToObject(assocList);
    const keys = assocList.map(item => item.key);
    // Need to hold onto keys to compare when receiving props.
    this.keysBeforeChange = keys;
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
