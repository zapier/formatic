'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var wrapPure = function wrapPure(Component) {

  var WrapPure = _react2['default'].createClass({
    displayName: 'WrapPure',

    mixins: [_react2['default'].PureRenderMixin],

    render: function render() {
      return _react2['default'].createElement(Component, this.props);
    }
  });

  return WrapPure;
};

exports['default'] = wrapPure;
module.exports = exports['default'];