// # pretty-select-input component

/*
   Render an input to be used as the element for typing a custom value into a pretty select.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _utils = require('../../utils');

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'PrettySelectInput',

  mixins: [_helper2.default],

  render: function render() {
    return this.renderWithConfig();
  },

  focus: function focus() {
    if (this.textBoxRef && this.textBoxRef.focus) {
      this.textBoxRef.focus();
    }
  },

  setChoicesOpen: function setChoicesOpen(isOpenChoices) {
    this.textBoxRef.setChoicesOpen(isOpenChoices);
  },

  renderDefault: function renderDefault() {
    return this.props.config.createElement('pretty-text-input', {
      ref: (0, _utils.ref)(this, 'textBox'),
      classes: this.props.classes,
      onChange: this.props.onChange,
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      onAction: this.onBubbleAction,
      field: this.props.field,
      value: this.props.isEnteringCustomValue ? this.props.field.value : this.props.getDisplayValue(),
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      onTagClick: this.onTagClick,
      readOnly: !this.props.isEnteringCustomValue,
      disabled: this.isReadOnly()
    });
  }

});