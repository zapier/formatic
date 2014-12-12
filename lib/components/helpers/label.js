// # component.label

/*
Just the label for a field.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Label',

  mixins: [require('../../mixins/config')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var field = this.props.field;

    var label = null;
    if (typeof this.props.index === 'number') {
      label = '' + (this.props.index + 1) + '.';
      if (field.label) {
        label = label + ' ' + field.label;
      }
    }

    if (field.label || label) {
      var text = label || field.label;
      if (this.props.onClick) {
        text = R.a({href: 'JavaScript' + ':', onClick: this.props.onClick}, text);
      }
      label = R.label({}, text);
    }

    var required = R.span({className: 'required-text'});

    return R.div({
      className: cx(this.props.classes)
    },
      label,
      ' ',
      required
    );
  }
});
