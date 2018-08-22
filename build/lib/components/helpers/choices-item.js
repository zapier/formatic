// # choices-item component

/*
   Render a choice item wrapper.
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

  displayName: 'ChoicesItem',

  mixins: [_helper2.default],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var classes = _undash2.default.extend({}, this.props.classes);

    classes.choice = true;
    if (this.props.isHovering) {
      classes.hover = true;
    }

    return _react2.default.createElement(
      'li',
      { className: (0, _classnames2.default)(classes) },
      this.props.children
    );
  }

});