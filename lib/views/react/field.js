'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({

  render: function () {

    var field = this.props.field;

    return R.div({key: field.key, className: 'field ' + field.type + '-field'},
      R.label({},
        field.label
      ),
      this.props.children
    );
  }
});
