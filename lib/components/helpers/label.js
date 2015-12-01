// # label component

/*
Just the label for a field.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'Label',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    var fieldLabel = config.fieldLabel(field);

    var label = null;
    if (typeof this.props.index === 'number') {
      label = '' + (this.props.index + 1) + '.';
      if (fieldLabel) {
        label = label + ' ' + fieldLabel;
      }
    }

    if (fieldLabel || label) {
      var text = label || fieldLabel;
      if (this.props.onClick) {
        text = R.a({href: 'JavaScript' + ':', onClick: this.props.onClick}, text);
      }
      label = R.label({}, text);
    }

    return R.div({
      className: cx(this.props.classes)
    },
      label,
      ' ',
      R.span({className: config.fieldIsRequired(field) ? 'required-text' : 'not-required-text'})
    );
  }
});
