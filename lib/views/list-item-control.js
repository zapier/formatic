'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onMoveBack: function () {
      this.props.onMove(this.props.index, this.props.index - 1);
    },

    onMoveForward: function () {
      this.props.onMove(this.props.index, this.props.index + 1);
    },

    onRemove: function () {
      this.props.onRemove(this.props.index);
    },

    render: function () {
      var field = this.props.field;

      return R.div({className: this.props.className},
        formatic.view('remove-item')({field: field, onClick: this.onRemove}),
        this.props.index > 0 ? formatic.view('move-item-back')({onClick: this.onMoveBack}) : null,
        this.props.index < (this.props.numItems - 1) ? formatic.view('move-item-forward')({onClick: this.onMoveForward}) : null
      );
    }
  });
};
