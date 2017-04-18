// # assoc-item-value component

/*
Render the value of an object item.
*/

'use strict';

var React = require('react');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'AssocListItemValue',

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

    const fieldElem = config.createFieldElement({
      field: field,
      onChange: this.onChangeField,
      plain: true,
      onAction: this.onBubbleAction
    });

    return (
      <div className={cx(this.props.classes)}>
        {fieldElem}
      </div>
    );
  }
});
