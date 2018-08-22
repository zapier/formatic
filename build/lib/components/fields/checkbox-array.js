// # checkbox-array component

/*
Used with array values to supply multiple checkboxes for adding multiple
enumerated values to an array.
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

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _field = require('../../mixins/field');

var _field2 = _interopRequireDefault(_field);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'CheckboxArray',

  mixins: [_field2.default],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  onChange: function onChange() {
    // Get all the checked checkboxes and convert to an array of values.
    var choiceNodes = this.choicesRef.getElementsByTagName('input');
    choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
    var values = choiceNodes.map(function (node) {
      return node.checked ? node.value : null;
    }).filter(function (value) {
      return value;
    });
    this.onChangeValue(values);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var choices = this.state.choices || [];

    var isInline = !_undash2.default.find(choices, function (choice) {
      return choice.sample;
    });

    var inputs = choices.map(function (choice, i) {
      var inputField = _react2.default.createElement(
        'span',
        { style: { whiteSpace: 'nowrap' } },
        _react2.default.createElement('input', {
          name: field.key,
          type: 'checkbox',
          value: choice.value,
          checked: field.value.indexOf(choice.value) >= 0 ? true : false,
          onChange: this.onChange,
          onFocus: this.onFocusAction,
          onBlur: this.onBlurAction,
          disabled: this.isReadOnly() }),
        _react2.default.createElement(
          'span',
          { className: 'field-choice-label' },
          choice.label
        )
      );

      if (isInline) {
        return _react2.default.createElement(
          'span',
          { key: i, className: 'field-choice' },
          inputField,
          ' '
        );
      }

      return _react2.default.createElement(
        'span',
        { key: i, className: 'field-choice' },
        inputField,
        ' ',
        config.createElement('sample', { field: field, choice: choice })
      );
    }.bind(this));

    return config.createElement('field', {
      field: field
    }, _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)(this.props.classes), ref: (0, _utils.ref)(this, 'choices') },
      inputs
    ));
  }
});