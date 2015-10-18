'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var provideContext = function provideContext(Component) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$childContext = _ref.childContext;
  var childContext = _ref$childContext === undefined ? function () {
    return {};
  } : _ref$childContext;

  var ProvideContext = _react2['default'].createClass({
    displayName: 'ProvideContext',

    getChildContext: function getChildContext() {
      return childContext(this.props);
    },

    render: function render() {
      return _react2['default'].createElement(Component, this.props);
    }
  });

  return ProvideContext;
};

exports['default'] = provideContext;
module.exports = exports['default'];