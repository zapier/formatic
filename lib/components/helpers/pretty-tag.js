// # pretty-tag component

/*
   Pretty text tag
 */

'use strict';

var PropTypes = require('prop-types');

var React = require('react');
var _ = require('../../undash');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'PrettyTag',

  propTypes: {
    onClick: PropTypes.func,
    classes: PropTypes.object
  },

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var classes = cx(_.extend({}, this.props.classes, {'pretty-part': true}));

    return (
      <span className={classes} onClick={this.props.onClick}>
        {this.props.children}
      </span>
    );
  }
});
