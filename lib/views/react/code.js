'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (formatic, config) {

  var className = 'field code-field';
  if (config.className) {
    className += ' ' + config.className;
  }

  var view = React.createClass({

    render: function () {
      return R.pre({className: className},
        this.props.field.value
      );
    }
  });

  formatic.view(config.type, view);
};
