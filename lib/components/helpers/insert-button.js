// # button component

/*
  Clickable 'button'
*/

'use strict';

var React = require('react');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'InsertButton',

  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <a href={'JavaScript' + ':'} onClick={this.props.onClick}
         className={cx({ 'readonly-control': this.props.readOnly })}>
        {this.props.children}
      </a>
    );
  }

});
