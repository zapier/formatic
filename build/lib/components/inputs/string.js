'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var StringInput = _react2['default'].createClass({
  displayName: 'StringInput',

  statics: {
    hasEvent: true
  },

  propTypes: {
    value: _react2['default'].PropTypes.string.isRequired,
    onChange: _react2['default'].PropTypes.func.isRequired
  },

  render: function render() {
    var _props = this.props;
    var value = _props.value;
    var onChange = _props.onChange;
    var onFocus = _props.onFocus;
    var onBlur = _props.onBlur;

    return _react2['default'].createElement('textarea', { value: value, onChange: onChange, onFocus: onFocus, onBlur: onBlur });
  }
});

exports['default'] = StringInput;
module.exports = exports['default'];