'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var wrapChildInput = function wrapChildInput(Input) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$defaultValue = _ref.defaultValue;
  var defaultValue = _ref$defaultValue === undefined ? '' : _ref$defaultValue;

  var WrapChildInput = _react2['default'].createClass({
    displayName: 'WrapChildInput',

    mixins: [_react2['default'].PureRenderMixin],

    propTypes: {
      parentValue: _react2['default'].PropTypes.object.isRequired,
      childKey: _react2['default'].PropTypes.string.isRequired,
      onChange: _react2['default'].PropTypes.func.isRequired
    },

    childValue: function childValue() {
      var _props = this.props;
      var parentValue = _props.parentValue;
      var childKey = _props.childKey;

      var childValue = parentValue[childKey];
      if (_undash2['default'].isUndefined(childValue)) {
        return defaultValue;
      }
      return childValue;
    },

    onChange: function onChange(newValue) {
      var _props2 = this.props;
      var onChange = _props2.onChange;
      var childKey = _props2.childKey;

      onChange(newValue, {
        path: [childKey]
      });
    },

    render: function render() {
      var childValue = this.childValue;
      var onChange = this.onChange;

      var value = childValue();
      var _props3 = this.props;
      var parentKey = _props3.parentKey;
      var childKey = _props3.childKey;

      var props = _objectWithoutProperties(_props3, ['parentKey', 'childKey']);

      return _react2['default'].createElement(Input, _extends({}, props, { value: value, onChange: onChange }));
    }
  });

  return WrapChildInput;
};

exports['default'] = wrapChildInput;
module.exports = exports['default'];