// # component.list

/*
Render a list.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: 'List',

  mixins: [require('../../mixins/field')],

  // getDefaultProps: function () {
  //   return {
  //     className: plugin.config.className
  //   };
  // },

  nextLookupId: 0,

  getInitialState: function () {

    // Need to create artificial keys for the array. Indexes are not good keys,
    // since they change. So, map each position to an artificial key
    var lookups = [];

    var items = this.props.value;

    items.forEach(function (item, i) {
      lookups[i] = '_' + this.nextLookupId;
      this.nextLookupId++;
    }.bind(this));

    return {
      lookups: lookups
    };
  },

  componentWillReceiveProps: function (newProps) {

    var lookups = this.state.lookups;

    var items = newProps.value;

    // Need to set artificial keys for new array items.
    if (items.length > lookups.length) {
      for (var i = lookups.length; i < items.length; i++) {
        lookups[i] = '_' + this.nextLookupId;
        this.nextLookupId++;
      }
    }

    this.setState({
      lookups: lookups
    });
  },

  onChange: function (i, newValue, info) {
    var newArrayValue = this.props.value.slice(0);
    newArrayValue[i] = newValue;
    this.props.onChange(newArrayValue, {
      field: this.props.field,
      fields: [this.props.field].concat(info.fields)
    });
  },

  onAppend: function (itemChoiceIndex) {
    var config = this.props.config;
    var newValue = config.fieldItemValue(this.props.field, itemChoiceIndex);
    var items = this.props.value;

    items = items.concat(newValue);

    this.onChangeValue(items);
  },
  //
  // onClickLabel: function (i) {
  //   if (this.props.field.collapsableItems) {
  //     var collapsed;
  //     // if (!this.state.collapsed[i]) {
  //     //   collapsed = this.state.collapsed;
  //     //   collapsed[i] = true;
  //     //   this.setState({collapsed: collapsed});
  //     // } else {
  //     //   collapsed = this.props.field.fields.map(function () {
  //     //     return true;
  //     //   });
  //     //   collapsed[i] = false;
  //     //   this.setState({collapsed: collapsed});
  //     // }
  //     collapsed = this.state.collapsed;
  //     collapsed[i] = !collapsed[i];
  //     this.setState({collapsed: collapsed});
  //   }
  // },
  //
  onRemove: function (i) {
    var lookups = this.state.lookups;
    lookups.splice(i, 1);
    this.setState({
      lookups: lookups
    });
    var newItems = this.props.value.slice(0);
    newItems.splice(i, 1);
    this.onChangeValue(newItems);
  },
  //
  onMove: function (fromIndex, toIndex) {
    var lookups = this.state.lookups;
    var fromId = lookups[fromIndex];
    var toId = lookups[toIndex];
    lookups[fromIndex] = toId;
    lookups[toIndex] = fromId;
    this.setState({
      lookups: lookups
    });

    var newItems = this.props.value.slice(0);
    if (fromIndex !== toIndex &&
      fromIndex >= 0 && fromIndex < newItems.length &&
      toIndex >= 0 && toIndex < newItems.length
    ) {
      newItems.splice(toIndex, 0, newItems.splice(fromIndex, 1)[0]);
    }
    this.onChangeValue(newItems);
  },

  getFields: function () {
    var config = this.props.config;
    var items = this.props.value;
    var field = this.props.field;

    return items.map(function (item, i) {
      var childField = config.fieldItemForValue(field, item);
      childField = _.extend({}, childField);
      childField.key = i;
      return childField;
    });
  },

  render: function () {

    var config = this.props.config;
    var field = this.props.field;
    var fields = this.getFields();
    var items = this.props.value;

    var numItems = fields.length;
    return config.createElement('field', {
      field: field, plain: this.props.plain
    },
      R.div({className: cx(this.props.classes)},
        CSSTransitionGroup({transitionName: 'reveal'},
          fields.map(function (childField, i) {
            return config.createElement('list-item', {
              key: this.state.lookups[i],
              field: childField,
              value: items[i],
              index: i,
              numItems: numItems,
              onMove: this.onMove,
              onRemove: this.onRemove,
              onChange: this.onChange
            });
          }.bind(this))
        ),
        config.createElement('list-control', {field: field, onAppend: this.onAppend})
      )
    );
  }
});
