'use strict';

var React = require('react');
var R = React.DOM;

module.exports = function (formatic, config) {

  var className = config.className || '';

  var view = React.createClass({

    mixins: [require('./mixins/input-actions')],

    render: function () {

      var field = this.props.field;

      return R.input({
        className: className,
        type: field.type,
        name: field.key,
        value: field.value,
        onChange: this.onChange,
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        readOnly: field.isReadOnly
      });
    }
  });

  formatic.view(config.type, view);
};
