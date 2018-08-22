// # remove-item component

/*
Remove an item.
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

  displayName: 'RemoveItem',

  mixins: [_helper2.default],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[remove]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onMouseOverRemove: function onMouseOverRemove() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(true);
    }
  },

  onMouseOutRemove: function onMouseOutRemove() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(false);
    }
  },

  renderDefault: function renderDefault() {
    var _this = this;

    if (this.props.readOnly) {
      var classes = _undash2.default.extend({}, this.props.classes, { 'readonly-control': this.props.readOnly });

      return _react2.default.createElement(
        'span',
        { className: (0, _classnames2.default)(classes) },
        this.props.label
      );
    }

    var onKeyDown = function onKeyDown(event) {
      if (event.keyCode === 13) {
        _this.props.onClick(event);
      }
    };

    return _react2.default.createElement(
      'span',
      {
        tabIndex: 0,
        className: (0, _classnames2.default)(this.props.classes),
        onKeyDown: onKeyDown,
        onClick: this.props.onClick,
        onMouseOver: this.onMouseOverRemove,
        onMouseOut: this.onMouseOutRemove },
      this.props.label
    );
  }
});