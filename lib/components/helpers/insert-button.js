// # button component

/*
  Clickable 'button'
*/

'use strict';

var React = require('react/addons');

module.exports = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    ref: React.PropTypes.string
  },

  displayName: 'InsertButton',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <a ref={this.props.ref} href={'JavaScript' + ':'} onClick={this.props.onClick}>
        {this.props.children}
      </a>
    );
  }

});
