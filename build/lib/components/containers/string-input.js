'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactUtils = require('../../react-utils');

var StringInputContainer = _react2['default'].createClass({
  displayName: 'StringInputContainer',

  propTypes: {
    value: _react2['default'].PropTypes.string.isRequired,
    onChange: _react2['default'].PropTypes.func.isRequired
  },

  render: function render() {
    var _props = this.props;
    var children = _props.children;

    var props = _objectWithoutProperties(_props, ['children']);

    return (0, _reactUtils.cloneChild)(this.props.children, props);
  }
});

exports['default'] = StringInputContainer;
module.exports = exports['default'];