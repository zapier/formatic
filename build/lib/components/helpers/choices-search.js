// # choices-search component

/*
   Render a search box for choices.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'ChoicesSearch',

  mixins: [_helper2.default],

  focus: function focus() {
    this.inputRef.focus();
  },


  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return _react2.default.createElement(
      'div',
      { className: 'choices-search' },
      _react2.default.createElement('input', { ref: (0, _utils.ref)(this, 'input'), type: 'text', placeholder: 'Search...', onChange: this.props.onChange })
    );
  }

});