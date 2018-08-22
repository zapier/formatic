// # single-line-string component

/*
Render a single line text input.
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

  displayName: 'SingleLineString',

  mixins: [_field2.default],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var readOnly = config.fieldIsReadOnly(field);
    var tabIndex = readOnly ? -1 : this.props.tabIndex || 0;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, _react2.default.createElement('input', {
      tabIndex: tabIndex,
      type: 'text',
      value: this.props.field.value,
      className: (0, _classnames2.default)(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      autoComplete: field.autoComplete,
      autoFocus: field.autoFocus,
      placeholder: field.placeholder,
      readOnly: readOnly }));
  }
});