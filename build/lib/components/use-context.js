'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var useContext = function useContext(Component) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$contextTypes = _ref.contextTypes;
  var contextTypes = _ref$contextTypes === undefined ? {} : _ref$contextTypes;
  var _ref$contextToProps = _ref.contextToProps;
  var contextToProps = _ref$contextToProps === undefined ? {} : _ref$contextToProps;

  var UseContext = _react2['default'].createClass({
    displayName: 'UseContext',

    contextTypes: contextTypes,

    propsFromContext: function propsFromContext() {
      var _this = this;

      var pairs = Object.keys(contextToProps).map(function (contextKey) {
        var propKey = contextToProps[contextKey];
        return [propKey, _this.context[contextKey]];
      });
      return _undash2['default'].object(pairs);
    },

    render: function render() {
      return _react2['default'].createElement(Component, _extends({}, this.props, this.propsFromContext()));
    }
  });

  return UseContext;
};

exports['default'] = useContext;
module.exports = exports['default'];