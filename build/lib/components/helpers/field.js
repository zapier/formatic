'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Field = _react2['default'].createClass({
  displayName: 'Field',

  propTypes: {
    components: _react2['default'].PropTypes.object.isRequired
  },

  render: function render() {
    var _props$components = this.props.components;
    var Label = _props$components.Label;
    var Help = _props$components.Help;

    return _react2['default'].createElement(
      'div',
      null,
      _react2['default'].createElement(Label, this.props),
      _react2['default'].createElement(Help, this.props),
      this.props.children
    );
  }
});

exports['default'] = Field;
module.exports = exports['default'];