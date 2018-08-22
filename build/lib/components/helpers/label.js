// # label component

/*
Just the label for a field.
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

  displayName: 'Label',

  mixins: [_helper2.default],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var fieldLabel = config.fieldLabel(field);
    var requiredLabel = config.createElement('required-label', {
      config: config,
      field: field
    });
    var label = null;

    if (typeof this.props.index === 'number') {
      label = '' + (this.props.index + 1) + '.';

      if (fieldLabel) {
        label = label + ' ' + fieldLabel;
      }
    }

    if (fieldLabel || label) {
      var text = label || fieldLabel;

      if (this.props.onClick) {
        text = _react2.default.createElement(
          'a',
          { href: 'JavaScript' + ':', onClick: this.props.onClick },
          text
        );
      }

      label = _react2.default.createElement(
        'label',
        null,
        text
      );
    }

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)(this.props.classes) },
      label,
      ' ',
      requiredLabel
    );
  }
});