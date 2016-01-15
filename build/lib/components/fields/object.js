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
    if (hasDuplicateKeys(this.state.assocList)) {
      return; // talk to the hand
    }

    var config = this.props.config;
    this.setState({
      assocList: config.objectToAssocList(newProps.field.value)
    });
  },

  onChange: function onChange(assocList) {
    var config = this.props.config;
    var value = config.assocListToObject(assocList);

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