// # object component

/*
Render a field to edit a array of key / value objects, where duplicate keys are allowed.
*/

'use strict';

const React = require('react');
const R = React.DOM;
const cx = require('classnames');
const update = require('react-addons-update');

module.exports = React.createClass({

  displayName: 'AssocList',

  mixins: [require('../../mixins/field')],

  getInitialState() {
    return {
      rows: this.props.field.value
    };
  },

  componentWillReceiveProps(newProps) {
    this.setState({rows: newProps.field.value});
  },

  onChange(index, newValue) {
    const updatedRow = {key: this.state.rows[index].key, value: newValue};
    const rows = update(this.state.rows, {
      $splice: [[index, 1, updatedRow]]
    });

    // this.onBubbleValue(rows, info);
    this.onChangeValue(rows);
  },

  onAppend() {
    const newRow = {key: '', value: ''};
    const rows = update(this.state.rows, {
      $push: [newRow]
    });

    this.onChangeValue(rows);
  },

  onRemove(index) {
    const rows = update(this.state.rows, {
      $splice: [[index, 1]]
    });

    this.onChangeValue(rows);
  },

  onChangeKey(index, newKey) {
    const updatedRow = {key: newKey, value: this.state.rows[index].value};
    const rows = update(this.state.rows, {
      $splice: [[index, 1, updatedRow]]
    });

    this.onChangeValue(rows);
  },

  render() {
    return this.renderWithConfig();
  },

  renderDefault() {
    const config = this.props.config;
    const field = this.props.field;
    const fields = config.createChildFields(field);

    return config.createElement('field', {
      field: field, plain: this.props.plain
    },
     R.div({className: cx(this.props.classes)},
        config.cssTransitionWrapper(
          this.state.rows.map(function (row, i) {
            return config.createElement('assoc-list-item', {
              index: i,
              displayKey: row.key,
              field: fields[i],
              onChangeKey: this.onChangeKey,
              onChange: this.onChange,
              onRemove: this.onRemove,
              onAction: this.onBubbleAction
            });
          }.bind(this))
        ),
        config.createElement('assoc-list-control', {field: field, onAppend: this.onAppend})
      )
    );
  }
});
