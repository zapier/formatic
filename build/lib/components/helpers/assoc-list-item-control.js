// # assoc-item-control component

/*
Render the remove buttons for an object item.
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

  displayName: 'AssocListItemControl',

  mixins: [_helper2.default],

  onRemove: function onRemove() {
    this.props.onRemove(this.props.index);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var isLastItem = field.fieldIndex === 0 && Object.keys(field.parent.value).length === 1;

    var removeItem = config.createElement('remove-item', {
      field: field,
      onClick: this.onRemove,
      readOnly: isLastItem && !config.isRemovalOfLastAssocListItemAllowed(field)
    });

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)(this.props.classes) },
      removeItem
    );
  }
});