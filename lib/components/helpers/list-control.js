// # component.list-control

/*
Render the item type choices and the add button.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ListControl',

  mixins: [require('../../mixins/helper')],

  getInitialState: function () {
    return {
      itemIndex: 0
    };
  },

  onSelect: function (index) {
    this.setState({
      itemIndex: index
    });
  },

  onAppend: function () {
    this.props.onAppend(this.state.itemIndex);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;
    var items = config.fieldItems(field);

    var typeChoices = null;

    if (items.length > 0) {
      typeChoices = config.createElement('item-choices', {field: field, value: this.state.itemIndex, onSelect: this.onSelect});
    }

    return R.div({className: cx(this.props.classes)},
      typeChoices, ' ',
      config.createElement('add-item', {onClick: this.onAppend})
    );
  }
});