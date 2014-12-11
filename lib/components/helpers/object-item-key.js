// # component.object-item-key

/*
Render an object item key editor.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onChange: function (event) {
      this.props.onChange(event.target.value);
    },

    render: function () {
      var field = this.props.field;

      var key = field.def.key;

      if (!_.isUndefined(this.props.tempKey)) {
        key = this.props.tempKey;
      }

      return R.input({className: this.props.className, type: 'text', value: key, onChange: this.onChange});
    }
  });
};
