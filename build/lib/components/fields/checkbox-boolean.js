// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
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

  displayName: 'CheckboxBoolean',

  mixins: [_field2.default],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.checked);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fieldLabelOrHelp = config.fieldHelpText(field) || config.fieldLabel(field);

    return config.createElement('field', {
      config: config, field: field, plain: true
    }, _react2.default.createElement(
      'span',
      { style: { whiteSpace: 'nowrap' } },
      _react2.default.createElement('input', {
        type: 'checkbox',
        checked: field.value,
        className: (0, _classnames2.default)(this.props.classes),
        onChange: this.onChange,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction,
        disabled: this.isReadOnly()
      }),
      _react2.default.createElement(
        'span',
        null,
        ' '
      ),
      _react2.default.createElement(
        'span',
        null,
        fieldLabelOrHelp
      )
    ));
  }
});