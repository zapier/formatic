'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var _2 = require('./');

var _3 = _interopRequireDefault(_2);

exports['default'] = function (containerProps) {

  var containerComponents = containerProps.components || {};

  var Component = (function (_React$Component) {
    _inherits(Component, _React$Component);

    function Component(props, context) {
      _classCallCheck(this, Component);

      _get(Object.getPrototypeOf(Component.prototype), 'constructor', this).call(this, props, context);
    }

    _createClass(Component, [{
      key: 'matchedComponentClass',
      value: function matchedComponentClass() {
        if (_undash2['default'].isFunction(this.props.$type)) {
          return this.props.$type;
        }
        if (_undash2['default'].isString(this.props.$type)) {
          var MatchedComponent = containerComponents[this.props.$type] || _3['default'][this.props.$type];
          if (!MatchedComponent) {
            throw new Error('Component not found: ' + this.props.$type);
          }
          return MatchedComponent;
        }
        throw new Error('Component requires $type to be a component class or name.');
      }
    }, {
      key: 'render',
      value: function render() {
        var _this = this;

        var MatchedComponent = this.matchedComponentClass();
        var propsWithoutName = {};
        Object.keys(this.props).forEach(function (propKey) {
          if (propKey === '$type') {
            return;
          }
          propsWithoutName[propKey] = _this.props[propKey];
        });
        return _react2['default'].createElement(MatchedComponent, _extends({}, propsWithoutName, { Component: Component }));
      }
    }]);

    return Component;
  })(_react2['default'].Component);

  Component.prototype.displayName = 'Component';

  return Component;
};

module.exports = exports['default'];