// # pretty-tag component

/*
   Pretty text tag
 */

'use strict';

var React = require('react/addons');
var _ = require('../../undash');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'PrettyTag',

  propTypes: {
    tag: React.PropTypes.string,
    pos: React.PropTypes.object,
    replaceChoices: React.PropTypes.array,
    onClick: React.PropTypes.func,
    classes: React.PropTypes.object
  },

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  onClick: function () {
    if (this.props.onClick) {
      this.props.onClick(this.props.pos);
    }
  },

  renderDefault: function () {
    var classes = cx(_.extend({}, this.props.classes, {'pretty-part': true}));

    return (
      <span className={classes} onClick={this.onClick}>
        {this.props.children}
      </span>
    );
  }
});
