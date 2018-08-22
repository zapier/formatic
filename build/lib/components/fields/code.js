'use strict';

/* global CodeMirror */
/*eslint no-script-url:0 */

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

var _field = require('../../mixins/field');

var _field2 = _interopRequireDefault(_field);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  A very trimmed down field that uses CodeMirror for syntax highlighting *only*.
 */
exports.default = (0, _createReactClass2.default)({
  displayName: 'Code',

  mixins: [_field2.default],

  componentDidMount: function componentDidMount() {
    this.createCodeMirrorEditor();
  },

  componentWillUnmount: function componentWillUnmount() {
    this.removeCodeMirrorEditor();
  },

  getInitialState: function getInitialState() {
    return {
      value: this.props.field.value
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.field.value });
  },

  tabIndex: function tabIndex() {
    if (this.isReadOnly()) {
      return null;
    }
    return this.props.field.tabIndex || 0;
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };

    var textBoxClasses = (0, _classnames2.default)(_undash2.default.extend({}, this.props.classes, { 'pretty-text-box': true }));

    // Render read-only version.
    var element = _react2.default.createElement(
      'div',
      { className: 'pretty-text-wrapper' },
      _react2.default.createElement(
        'div',
        { className: textBoxClasses, tabIndex: this.tabIndex(), onFocus: this.onFocusAction, onBlur: this.onBlurAction },
        _react2.default.createElement('div', { ref: (0, _utils.ref)(this, 'textBox'), className: 'internal-text-wrapper' })
      )
    );

    return config.createElement('field', props, element);
  },

  createCodeMirrorEditor: function createCodeMirrorEditor() {
    var config = this.props.config;
    var field = this.props.field;
    var readOnly = config.fieldIsReadOnly(field);

    var options = {
      lineWrapping: true,
      tabindex: this.tabIndex(),
      value: String(this.state.value),
      mode: this.props.field.language || null,
      indentWithTabs: false,
      indentUnit: 2,
      tabSize: 2,
      extraKeys: {
        Tab: function Tab(cm) {
          if (_undash2.default.any(cm.getSelections(), Boolean)) {
            cm.execCommand('defaultTab');
          } else {
            cm.execCommand('insertSoftTab');
          }
        },
        'Shift-Tab': function ShiftTab(cm) {
          cm.execCommand('indentLess');
        }
      },
      readOnly: readOnly ? 'nocursor' : false // 'nocursor' means read only and not focusable
    };

    if (this.props.field.language === 'python') {
      options.indentUnit = 4;
      options.tabSize = 4;
    }

    if (this.props.field.codeMirrorOptions) {
      options = _undash2.default.extend({}, options, this.props.field.codeMirrorOptions);
    }

    var textBox = this.textBoxRef;
    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on('change', this.onCodeMirrorChange);
  },

  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.textBoxRef;
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror.off('change', this.onCodeMirrorChange);
    this.codeMirror = null;
  },

  onCodeMirrorChange: function onCodeMirrorChange() {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    var newValue = this.codeMirror.getValue();
    this.onChangeValue(newValue);
    this.setState({ value: newValue });
  }

});