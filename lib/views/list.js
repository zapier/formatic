'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

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
    // onAppend: function () {
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
    // },
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
    // onDelete: function (i) {
    //   var collapsed = this.state.collapsed;
    //   collapsed.splice(i, 1);
    //
    //   var lookups = this.state.lookups;
    //   lookups.splice(i, 1);
    //
    //   this.setState({
    //     lookups: lookups,
    //     collapsed: collapsed
    //   });
    // },
    //
    // onMove: function (fromIndex, toIndex) {
    //   var collapsed = this.state.collapsed;
    //   collapsed.splice(toIndex, 0, collapsed.splice(fromIndex, 1)[0]);
    //   var lookups = this.state.lookups;
    //   lookups.splice(toIndex, 0, lookups.splice(fromIndex, 1)[0]);
    //   this.setState({
    //     lookups: lookups,
    //     collapsed: collapsed
    //   });
    // },

    render: function () {

      var field = this.props.field;
      var fields = this.props.fields;

      // var className = formatic.className(plugin.config.className, field.className);
      // var typeChoiceClassName = formatic.className('list-type-choice', plugin.config.typeChoice_className, field.typeChoice_className);
      // var addContainerClassName = formatic.className('list-control-add-container', plugin.config.addContainer_className, field.addContainer_className);
      // var addClassName = formatic.className('list-control-add', plugin.config.addButton_className, field.addButton_className);
      // var addLabel = plugin.configValue('addButton_label', '[add]');

      var numItems = fields.length;

      // var typeChoices = null;
      // if (field.itemTypes) {
      //   typeChoices = R.select({ref: 'typeSelect', className: typeChoiceClassName},
      //     field.itemTypes.map(function (item, i) {
      //       return R.option({value: i}, item.label || item.type);
      //     })
      //   );
      // }

      return formatic.view('field')({
        field: field
      },
        React.addons.CSSTransitionGroup({transitionName: 'reveal'},
          fields.map(function (child, i) {
            return formatic.view('list-item')({
              key: i,
              field: child,
              parent: field,
              index: i,
              numItems: numItems
            });
          }.bind(this))
        )
        // ,
        // R.div({className: addContainerClassName},
        //   typeChoices, ' ',
        //   R.span({className: addClassName, onClick: this.onAppend}, addLabel)
        // )
      );
    }
  });
};
