'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _createContextComponent = require('../create-context-component');

var _createContextComponent2 = _interopRequireDefault(_createContextComponent);

var ComponentContainer = _react2['default'].createClass({
  displayName: 'ComponentContainer',

  render: function render() {
    var children = this.props.children;

    var Component = (0, _createContextComponent2['default'])(this.props);

    if (_undash2['default'].isFunction(children)) {
      return children(Component);
    }

    return _react2['default'].createElement(
      'span',
      null,
      _react2['default'].Children.map(function (child) {
        return _react2['default'].cloneElement(child, { Component: Component });
      })
    );
  }
});

exports['default'] = ComponentContainer;
module.exports = exports['default'];