'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _undash = require('./undash');

var _undash2 = _interopRequireDefault(_undash);

var cloneChild = function cloneChild(children, props) {
  if (_undash2['default'].isFunction(children)) {
    return children(props);
  }

  var child = _react2['default'].Children.only(children);

  return _react2['default'].cloneElement(child, props);
};

exports.cloneChild = cloneChild;