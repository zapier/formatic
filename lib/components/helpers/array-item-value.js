// # array-item-value component

/*
Render the value of an array item.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

module.exports = createReactClass({

  displayName: 'ArrayItemValue',

  mixins: [require('../../mixins/helper')],

  onChangeField: function (newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return (
      <div className={cx(this.props.classes)}>
        {config.createFieldElement({field: field, onChange: this.onChangeField, onAction: this.onBubbleAction})}
      </div>
    );
  }
});
