'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    mixins: [require('./mixins/input-actions')],

    render: function () {

      var className = formatic.className(plugin.config.className, this.props.field.className);

      var field = this.props.field;

      return R.textarea(_.extend({
        className: className,
        name: field.key,
        value: field.value,
        onChange: this.onChange,
        onFocus: this.onFocus,
        onBlur: this.onBlur
      }, plugin.config.attributes));
    }
  });
};
