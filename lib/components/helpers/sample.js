// # help component

/*
Just the help text block.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

module.exports = createReactClass({

  displayName: 'Sample',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var choice = this.props.choice;

    return !choice.sample ? null : (
      <div className={cx(this.props.className)}>
        {choice.sample}
      </div>
    );
  }
});
