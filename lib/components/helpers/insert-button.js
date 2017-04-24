// # button component

/*
  Clickable 'button'
*/

'use strict';

var PropTypes = require('prop-types');

var React = require('react');
var createReactClass = require('create-react-class');
var cx = require('classnames');

module.exports = createReactClass({

  displayName: 'InsertButton',

  propTypes: {
    onClick: PropTypes.func.isRequired
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
