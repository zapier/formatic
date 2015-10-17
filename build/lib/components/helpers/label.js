'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Label = _react2['default'].createClass({
  displayName: 'Label',

  render: function render() {
    var _props$label = this.props.label;
    var label = _props$label === undefined ? '' : _props$label;

    return _react2['default'].createElement(
      'div',
      null,
      label
    );
  }
});

exports['default'] = Label;
module.exports = exports['default'];