// # choices-item component

/*
   Render a choice item wrapper.
 */

'use strict';

var React = require('react');
var cx = require('classnames');

var _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'ChoicesItem',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var classes = _.extend({}, this.props.classes);

    classes.choice = true;
    if (this.props.isHovering) {
      classes.hover = true;
    }

    return (
      <li className={cx(classes)}>{this.props.children}</li>
    );
  }

});
