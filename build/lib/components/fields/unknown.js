// # unknown component

/*
Render a field with an unknown type.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _field = require('../../mixins/field');

var _field2 = _interopRequireDefault(_field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'Unknown',

  mixins: [_field2.default],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        null,
        'Component not found for:'
      ),
      _react2.default.createElement(
        'pre',
        null,
        JSON.stringify(this.props.field.rawFieldTemplate, null, 2)
      )
    );
  }
});