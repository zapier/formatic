'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var StringInputView = _react2['default'].createClass({
  displayName: 'StringInputView',

  render: function render() {
    return _react2['default'].createElement('textarea', this.props);
  }
});

exports['default'] = StringInputView;
module.exports = exports['default'];