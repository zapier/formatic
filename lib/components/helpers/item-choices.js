// # component.item-choices

/*
Give a list of choices of item types to create as children of an field.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ItemChoices',

  mixins: [require('../../mixins/helper')],

  onChange: function (event) {
    this.props.onSelect(parseInt(event.target.value));
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;
    var items = config.fieldItems(field);

    var typeChoices = null;
    if (items.length > 1) {
      typeChoices = R.select({className: cx(this.props.classes), value: this.value, onChange: this.onChange},
        items.map(function (item, i) {
          return R.option({key: i, value: i}, item.label || i);
        })
      );
    }

    return typeChoices ? typeChoices : R.span(null);
  }
});
