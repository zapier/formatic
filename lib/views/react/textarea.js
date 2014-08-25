'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, config) {

  config = config || {};

  var className = config.className || '';

  var view = React.createClass({

    mixins: [require('./mixins/input-actions')],

    render: function () {

      var field = this.props.field;

      return R.textarea(_.extend({
        className: className,
        name: field.key,
        value: field.value,
        onChange: this.onChange,
        onFocus: this.onFocus,
        onBlur: this.onBlur
      }, config.attributes));
    }
  });

  formatic.view(config.type, view);

};
