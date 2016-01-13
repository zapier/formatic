// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

'use strict';

const React = require('react');
const update = require('react-addons-update');

module.exports = React.createClass({

  displayName: 'Object',

  mixins: [require('../../mixins/field')],

  getInitialState() {
    const config = this.props.config;
    return {
      assocList: config.objectToAssocList(this.props.field.value)
    };
  },

  onChange(assocList) {
    const config = this.props.config;
    const value = config.assocListToObject(assocList);
    const field = update(this.props.field, {
      value: {$set: value}
    });

    this.setState({assocList});
    this.onBubbleValue(value, {field});
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
