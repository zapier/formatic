'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    // getInitialState: function () {
    //
    //   var nextId = 0;
    //   var lookups = [];
    //   this.props.field.fields.forEach(function (field, i) {
    //     lookups[i] = '_' + nextId;
    //     nextId++;
    //   });
    //
    //   return {
    //     lookups: lookups,
    //     nextId: nextId,
    //     collapsed: this.props.field.fields.map(function () {
    //       return this.props.field.collapsableItems ? true : false;
    //     }.bind(this))
    //   };
    // },
    //
    // componentWillReceiveProps: function (newProps) {
    //   var nextId = this.state.nextId;
    //   var lookups = this.state.lookups;
    //   var collapsed = this.state.collapsed;
    //   newProps.field.fields.forEach(function (field, i) {
    //     if (!lookups[i]) {
    //       lookups[i] = '_' + nextId;
    //       nextId++;
    //     }
    //     if (collapsed.length === i) {
    //       collapsed.push(false);
    //       if (this.props.field.collapsableItems) {
    //         collapsed[i] = true;
    //       }
    //     }
    //   }.bind(this));
    //   this.setState({
    //     lookups: lookups,
    //     nextId: nextId
    //   });
    // },
    //
    onAppend: function (itemIndex) {
      var fieldDef = this.props.field.get('items').get(itemIndex).deref().toJS();
      this.props.field.append(fieldDef);
    //   var field = this.props.field;
    //   var item = null;
    //   if (this.refs.typeSelect) {
    //     var index = parseInt(this.refs.typeSelect.getDOMNode().value);
    //     item = field.itemTypes[index].item;
    //   }
    //   this.props.form.actions.insert(this.props.field, null, item);
    //   if (this.props.field.collapsableItems) {
    //     // var collapsed = this.props.field.fields.map(function () {
    //     //   return true;
    //     // }.bind(this));
    //     var collapsed = this.state.collapsed;
    //     collapsed = collapsed.concat(false);
    //     this.setState({
    //       collapsed: collapsed
    //     });
    //   }
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
      this.props.field.remove(i);
    },
    //
    onMove: function (fromIndex, toIndex) {
      this.props.field.move(fromIndex, toIndex);
    },

    render: function () {

      var field = this.props.field;
      var fields = this.props.fields;

      var numItems = fields.length;

      return R.div({className: this.props.className},
        formatic.view('field')({
          field: field
        },
          React.addons.CSSTransitionGroup({transitionName: 'reveal'},
            fields.map(function (child, i) {
              return formatic.view('list-item')({
                key: child.id(),
                field: child,
                parent: field,
                index: i,
                numItems: numItems,
                onMove: this.onMove,
                onRemove: this.onRemove
              });
            }.bind(this))
          ),
          formatic.view('list-control')({field: field, onAppend: this.onAppend})
        )
      );
    }
  });
};
