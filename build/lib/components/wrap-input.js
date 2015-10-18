'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = wrapInput;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');
var u = require('../undash');

function wrapInput(InputComponent) {

  var WrapInput = React.createClass({
    displayName: 'WrapInput',

    mixins: [React.PureRenderMixin],

    getInitialState: function getInitialState() {
      return {
        isControlled: !u.isUndefined(this.props.value),
        value: u.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
      };
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
      if (this.state.isControlled) {
        if (!u.isUndefined(newProps.value)) {
          this.setState({
            value: newProps.value
          });
        }
      }
    },

    onChange: function onChange(newValue, info) {

      if (InputComponent.hasEvent || this.props.hasEvent) {
        var _event = newValue;
        newValue = _event.target.value;
      }

      if (!this.state.isControlled) {
        this.setState({
          value: newValue
        });
      }
      if (!this.props.onChange) {
        return;
      }
      this.props.onChange(newValue, info);
    },

    render: function render() {
      var _props = this.props;
      var hasEvent = _props.hasEvent;

      var props = _objectWithoutProperties(_props, ['hasEvent']);

      return React.createElement(InputComponent, _extends({}, props, {
        value: this.state.value,
        onChange: this.onChange
      }));
    }
  });

  return WrapInput;
}

module.exports = exports['default'];