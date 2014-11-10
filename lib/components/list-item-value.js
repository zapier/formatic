// # component.list-item-value

/*
Render the value of a list item.
*/

'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

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
