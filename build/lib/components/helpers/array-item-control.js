// # array-item-control component

/*
Render the remove and move buttons for an array field.
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

  displayName: 'ArrayItemControl',

  mixins: [_helper2.default],

  onMoveBack: function onMoveBack() {
    this.props.onMove(this.props.index, this.props.index - 1);
  },

  onMoveForward: function onMoveForward() {
    this.props.onMove(this.props.index, this.props.index + 1);
  },

  onRemove: function onRemove() {
    this.props.onRemove(this.props.index);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var isLastItem = field.fieldIndex === 0 && field.parent.value.length === 1;

    var isFirstItem = field.fieldIndex === 0;

    var isLastMoveableItem = field.fieldIndex === field.parent.value.length - 1;

    var removeItemControl = config.createElement('remove-item', {
      field: field, onClick: this.onRemove, onMaybeRemove: this.props.onMaybeRemove,
      readOnly: isLastItem && !config.isRemovalOfLastArrayItemAllowed(field)
    });

    var moveItemForward = this.props.index < this.props.numItems - 1 ? config.createElement('move-item-forward', { field: field, onClick: this.onMoveForward, classes: { 'is-first-item': isFirstItem } }) : null;

    var moveItemBack = this.props.index > 0 ? config.createElement('move-item-back', { field: field, onClick: this.onMoveBack, classes: { 'is-last-item': isLastMoveableItem } }) : null;

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)(this.props.classes) },
      removeItemControl,
      moveItemBack,
      moveItemForward
    );
  }
});