// # field-template-choices component

/*
Give a list of choices of item types to create as children of an field.
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

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'FieldTemplateChoices',

  mixins: [_helper2.default],

  onChange: function onChange(event) {
    this.props.onSelect(parseInt(event.target.value));
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fieldTemplates = config.fieldItemFieldTemplates(field);

    return fieldTemplates.length < 2 ? null : _react2.default.createElement(
      'select',
      {
        className: (0, _classnames2.default)(this.props.classes),
        value: this.fieldTemplateIndex,
        onChange: this.onChange },
      fieldTemplates.map(function (fieldTemplate, i) {
        return _react2.default.createElement(
          'option',
          { key: i, value: i },
          fieldTemplate.label || i
        );
      })
    );
  }
});