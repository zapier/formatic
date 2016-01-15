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
    this.setState({
      assocList: config.objectToAssocList(newProps.field.value)
    });
  },

  onChange(assocList) {
    const config = this.props.config;
    const value = config.assocListToObject(assocList);

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
