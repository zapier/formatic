// # assoc-item component

/*
Render an object item.
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

  displayName: 'AssocListItem',

  mixins: [_helper2.default],

  onChangeKey: function onChangeKey(newKey) {
    this.props.onChangeKey(this.props.index, newKey);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var assocListItemKey = config.createElement('assoc-list-item-key', {
      field: field,
      onChange: this.onChangeKey,
      onAction: this.onBubbleAction,
      displayKey: this.props.displayKey,
      isDuplicateKey: this.props.isDuplicateKey
    });

    var assocListItemValue = config.createElement('assoc-list-item-value', {
      field: field,
      onChange: this.props.onChange,
      onAction: this.onBubbleAction,
      index: this.props.index
    });

    var assocListItemControl = config.createElement('assoc-list-item-control', {
      field: field,
      onRemove: this.props.onRemove,
      index: this.props.index
    });

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)(this.props.classes) },
      assocListItemKey,
      assocListItemValue,
      assocListItemControl
    );
  }
});