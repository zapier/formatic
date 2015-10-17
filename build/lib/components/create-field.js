'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var createField = function createField(Input) {
  var _ref = arguments[1] === undefined ? {} : arguments[1];

  var name = _ref.name;

  if (!name) {
    if (Input.displayName.indexOf('Input') > 0) {
      name = Input.displayName.substring(0, Input.displayName.indexOf('Input'));
    }
  }

  if (!name) {
    throw new Error('Field requires a displayName.');
  }

  var FieldInput = _react2['default'].createClass({

    displayName: name,

    propTypes: {
      components: _react2['default'].PropTypes.object.isRequired
    },

    render: function render() {
      var Field = this.props.components.Field;

      return _react2['default'].createElement(
        Field,
        this.props,
        _react2['default'].createElement(Input, this.props)
      );
    }
  });

  return FieldInput;
};

exports['default'] = createField;
module.exports = exports['default'];