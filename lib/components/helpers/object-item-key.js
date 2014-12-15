// # component.object-item-key

/*
Render an object item key editor.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ObjectItemKey',

  mixins: [require('../../mixins/config')],

  onChange: function (event) {
    this.props.onChange(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var field = this.props.field;

    var key = field.key;

    if (!_.isUndefined(this.props.tempKey)) {
      key = this.props.tempKey;
    }

    return R.input({className: cx(this.props.className), type: 'text', value: key, onChange: this.onChange});
  }
});
