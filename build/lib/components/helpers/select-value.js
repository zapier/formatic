// # select-value component

/*
Render a select dropdown for a list of choices. Choices values can be of any
type.
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

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'SelectValue',

  mixins: [_helper2.default],

  onChange: function onChange(event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
    if (choiceType === 'choice') {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var choices = this.props.choices || [];

    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === '///loading///' || config.fieldIsLoading(this.props.field)) {
      choicesOrLoading = config.createElement('loading-choices', {});
    } else {
      var value = this.props.field.value !== undefined ? this.props.field.value : '';

      choices = choices.map(function (choice, i) {
        return {
          choiceValue: 'choice:' + i,
          value: choice.value,
          label: choice.label
        };
      });

      var valueChoice = _undash2.default.find(choices, function (choice) {
        return choice.value === value;
      });

      if (valueChoice === undefined) {

        var label = value;
        if (!_undash2.default.isString(value)) {
          label = JSON.stringify(value);
        }
        valueChoice = {
          choiceValue: 'value:',
          value: value,
          label: label
        };
        choices = [valueChoice].concat(choices);
      }

      choicesOrLoading = _react2.default.createElement(
        'select',
        {
          className: (0, _classnames2.default)(this.props.classes),
          onChange: this.onChange,
          value: valueChoice.choiceValue,
          onFocus: this.onFocusAction,
          onBlur: this.onBlurAction,
          disabled: this.isReadOnly() },
        choices.map(function (choice, i) {
          return _react2.default.createElement(
            'option',
            { key: i, value: choice.choiceValue },
            choice.label
          );
        })
      );
    }

    return choicesOrLoading;
  }
});