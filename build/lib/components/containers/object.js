'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var ObjectContainer = _react2['default'].createClass({
  displayName: 'ObjectContainer',

  propTypes: {
    value: _react2['default'].PropTypes.object,
    onChange: _react2['default'].PropTypes.func.isRequired,
    components: _react2['default'].PropTypes.object.isRequired
  },

  value: function value() {
    var value = this.props.value;

    if (_undash2['default'].isUndefined(value)) {
      return {};
    }
    return value;
  },

  onChangeChild: function onChangeChild(newChildValue, info) {
    var key = info.path[0];
    var newValue = _undash2['default'].extend({}, this.value(), _defineProperty({}, key, newChildValue));
    this.props.onChange(newValue, info);
  },

  childContextTypes: {
    onChangeChild: _react2['default'].PropTypes.func.isRequired,
    components: _react2['default'].PropTypes.object.isRequired
  },

  getChildContext: function getChildContext() {
    return {
      onChangeChild: this.onChangeChild,
      components: this.props.components
    };
  },

  render: function render() {
    var children = this.props.children;

    if (_undash2['default'].isFunction(children)) {
      return children(this.getChildContext());
    }
    return children;
  }
});

exports['default'] = ObjectContainer;
module.exports = exports['default'];