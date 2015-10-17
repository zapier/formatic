'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Help = _react2['default'].createClass({
  displayName: 'Help',

  render: function render() {
    var help = this.props.help;

    return !help ? null : _react2['default'].createElement(
      'div',
      null,
      help
    );
  }
});

exports['default'] = Help;
module.exports = exports['default'];