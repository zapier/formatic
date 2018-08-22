'use strict';

// # pretty-tag component

/*
   Pretty text tag
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

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'PrettyTag',

  propTypes: {
    onClick: _propTypes2.default.func,
    classes: _propTypes2.default.object
  },

  mixins: [_helper2.default],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var classes = (0, _classnames2.default)(_undash2.default.extend({}, this.props.classes, { 'pretty-part': true }));

    return _react2.default.createElement(
      'span',
      { className: classes, onClick: this.props.onClick },
      this.props.children
    );
  }
});