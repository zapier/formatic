'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var ObjectContainer = _react2['default'].createClass({
  displayName: 'ObjectContainer',

  propTypes: {
    value: _react2['default'].PropTypes.object,
    onChange: _react2['default'].PropTypes.func.isRequired
  },

  value: function value() {
    var value = this.props.value;

    if (_undash2['default'].isUndefined(value)) {
      return {};
    }
    return value;
  },

  onChangeChild: function onChangeChild(newChildValue, info) {
    var onChange = this.props.onChange;

    var key = info.path[0];
    var newValue = _undash2['default'].extend({}, this.value(), _defineProperty({}, key, newChildValue));
    onChange(newValue, info);
  },

  render: function render() {
    var children = this.props.children;
    var onChangeChild = this.onChangeChild;

    return children({
      onChangeChild: onChangeChild
    });
  }
});

exports['default'] = ObjectContainer;
module.exports = exports['default'];