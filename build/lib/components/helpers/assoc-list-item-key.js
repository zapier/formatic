// # assoc-item-key component

/*
Render an object item key editor.
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

  displayName: 'AssocListItemKey',

  mixins: [_helper2.default],

  onChange: function onChange(event) {
    this.props.onChange(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var classes = _undash2.default.extend({}, this.props.classes);
    if (this.props.isDuplicateKey) {
      classes['validation-error-duplicate-key'] = true;
    }

    return _react2.default.createElement('input', {
      className: (0, _classnames2.default)(classes),
      type: 'text',
      value: this.props.displayKey,
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction });
  }
});