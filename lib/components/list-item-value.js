'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },
    //
    // getInitialState: function () {
    //   return {
    //     maybeDelete: false
    //   };
    // },
    //
    // onDelete: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onDelete) {
    //     this.props.onDelete(this.props.field.index);
    //   }
    //   this.props.form.actions.delete(parent, this.props.field.index);
    // },
    //
    // onMoveUp: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onMove) {
    //     this.props.onMove(this.props.field.index, this.props.field.index - 1);
    //   }
    //   this.props.form.actions.move(parent, this.props.field.index, this.props.field.index - 1);
    // },
    //
    // onMoveDown: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onMove) {
    //     this.props.onMove(this.props.field.index, this.props.field.index + 1);
    //   }
    //   this.props.form.actions.move(parent, this.props.field.index, this.props.field.index + 1);
    // },
    //
    // onMouseOver: function () {
    //   this.setState({
    //     maybeDelete: true
    //   });
    // },
    //
    // onMouseOut: function () {
    //   this.setState({
    //     maybeDelete: false
    //   });
    // },

    render: function () {
      var field = this.props.field;

      return R.div({className: this.props.className},
        plugin.component('field')({
          field: field,
          index: this.props.index
        },
          field.component()
        )
      );
    }
  });
};
