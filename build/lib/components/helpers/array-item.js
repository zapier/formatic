// # array-item component

/*
Render an array item.
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

  displayName: 'ArrayItem',

  mixins: [_helper2.default],

  getInitialState: function getInitialState() {
    return {
      isMaybeRemoving: false
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onMaybeRemove: function onMaybeRemove(isMaybeRemoving) {
    this.setState({
      isMaybeRemoving: isMaybeRemoving
    });
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var classes = _undash2.default.extend({}, this.props.classes);

    if (this.state.isMaybeRemoving) {
      classes['maybe-removing'] = true;
    }

    var arrayItemControl = void 0;
    if (!config.fieldIsReadOnly(field)) {
      arrayItemControl = config.createElement('array-item-control', {
        field: field,
        index: this.props.index,
        numItems: this.props.numItems,
        onMove: this.props.onMove,
        onRemove: this.props.onRemove,
        onMaybeRemove: this.onMaybeRemove
      });
    }

    var arrayItemValue = config.createElement('array-item-value', {
      field: field,
      index: this.props.index,
      onChange: this.props.onChange,
      onAction: this.onBubbleAction
    });

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)(classes) },
      arrayItemControl,
      arrayItemValue
    );
  }
});