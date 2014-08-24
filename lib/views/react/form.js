'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (formatic, config) {

  var className = 'formatic';

  if (config.className) {
    className += ' ' + config.className;
  }

  var view = React.createClass({
    render: function () {
      return R.form({className: className},
        this.props.field.fields.map(function (field) {
          return this.props.form.component(field);
        }.bind(this))
      );
    }
  });

  formatic.view(config.type, view);
};
