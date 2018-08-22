// # add-item component

/*
The add button to append an item to a field.
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

  displayName: 'AddItem',

  mixins: [_helper2.default],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[add]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var _this = this;

    var tabIndex = this.props.readOnly ? null : 0;

    var onKeyDown = function onKeyDown(event) {
      if (event.keyCode === 13) {
        _this.props.onClick(event);
      }
    };

    return _react2.default.createElement(
      'span',
      {
        tabIndex: tabIndex,
        onKeyDown: onKeyDown,
        className: (0, _classnames2.default)(this.props.classes),
        onClick: this.props.onClick },
      this.props.label
    );
  }
});