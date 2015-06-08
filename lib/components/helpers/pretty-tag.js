// # pretty-tag component

/*
   Pretty text tag
 */

'use strict';

var React = require('react/addons');
var _ = require('underscore');
var cx = require('classnames');

module.exports = React.createClass({
  propTypes: {
    tag: React.PropTypes.string,
    replaceChoices: React.PropTypes.array,
    onClick: React.PropTypes.func,
    classes: React.PropTypes.object
  },

  displayName: 'PrettyTag',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var classes = cx(_.extend({}, this.props.classes, {'pretty-part': true}));

    console.log('pretty classes', classes);
    return (
      <span className={classes} onClick={this.props.onClick}>
        {this.props.children}
      </span>
    );
  }
});
