// # copy component

/*
Render non-editable html/text (think article copy).
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _field = require('../../mixins/field');

var _field2 = _interopRequireDefault(_field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'Copy',

  mixins: [_field2.default],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return _react2.default.createElement('div', {
      className: (0, _classnames2.default)(this.props.classes),
      dangerouslySetInnerHTML: { __html: this.props.config.fieldHelpText(this.props.field) } });
  }
});