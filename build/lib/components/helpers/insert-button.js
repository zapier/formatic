'use strict';

// # button component

/*
  Clickable 'button'
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'InsertButton',

  propTypes: {
    onClick: _propTypes2.default.func.isRequired
  },

  mixins: [_helper2.default],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return _react2.default.createElement(
      'a',
      { href: 'JavaScript' + ':', onClick: this.props.onClick,
        className: (0, _classnames2.default)({ 'readonly-control': this.props.readOnly }) },
      this.props.children
    );
  }

});