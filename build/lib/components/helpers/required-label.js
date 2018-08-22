// # required label component

/*
  Required Label for a field
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

  displayName: 'RequiredLabel',

  mixins: [_helper2.default],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var fieldIsRequired = config.fieldIsRequired(field);
    var className = (0, _classnames2.default)('required-label', {
      'required-text': fieldIsRequired,
      'not-required-text': !fieldIsRequired
    });

    return _react2.default.createElement('span', { className: className });
  }
});