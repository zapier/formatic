// # add-item component

/*
The add button to append an item to a field.
*/

'use strict';

var React = require('react');
var R = React.DOM;
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'AddItem',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function () {
    return {
      label: '[add]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    const tabIndex = this.props.readOnly ? null : 0;

    const onKeyDown = (event) => {
      if (event.keyCode === 13) {
        this.props.onClick(event);
      }
    };

    return R.span({tabIndex, onKeyDown, className: cx(this.props.classes), onClick: this.props.onClick},
                  this.props.label);
  }
});
