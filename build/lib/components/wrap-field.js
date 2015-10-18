'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var _ = require('../undash');
var ComponentContainer = require('../../component-container');
var Wrapper = require('./wrapper');

exports['default'] = function (FieldComponent) {

  var WrapField = (function (_React$Component) {
    _inherits(WrapField, _React$Component);

    function WrapField(props, context) {
      _classCallCheck(this, WrapField);

      _get(Object.getPrototypeOf(WrapField.prototype), 'constructor', this).call(this, props, context);

      this.wrapper = Wrapper.create();

      this.state = {
        isControlled: !_.isUndefined(this.props.value),
        value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value,
        onChange: this.onChange.bind(this),
        components: this.props.components,
        combinedComponents: ComponentContainer.components(this.props.components)
      };
    }

    _createClass(WrapField, [{
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(newProps) {
        if (this.state.isControlled) {
          if (!_.isUndefined(newProps.value)) {
            this.setState({
              value: newProps.value
            });
          }
        }
        if (this.state.components !== newProps.components) {
          this.setState({
            components: newProps.components,
            combinedComponents: ComponentContainer.components(this.props.components)
          });
        }
      }
    }, {
      key: 'onChange',
      value: function onChange(newValue, info) {
        if (!this.state.isControlled) {
          this.setState({
            value: newValue
          });
        }
        if (!this.props.onChange) {
          return;
        }
        this.props.onChange(newValue, info);
      }
    }, {
      key: 'render',
      value: function render() {
        return React.createElement(FieldComponent, _extends({}, this.props, {
          value: this.state.value,
          onChange: this.state.onChange,
          components: this.state.combinedComponents
        }));
      }
    }]);

    return WrapField;
  })(React.Component);

  return WrapField;
};

module.exports = exports['default'];