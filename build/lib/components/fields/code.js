'use strict';
/* global CodeMirror */
/*eslint no-script-url:0 */

var React = require('react');
var _ = require('../../undash');
var cx = require('classnames');

/*
  A very trimmed down field that uses CodeMirror for syntax highlighting *only*.
 */
module.exports = React.createClass({
  displayName: 'Code',

  mixins: [require('../../mixins/field')],

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
    return this.props.field.tabIndex;
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };

    var textBoxClasses = cx(_.extend({}, this.props.classes, { 'pretty-text-box': true }));

    // Render read-only version.
    var element = React.createElement(
      'div',
      { className: 'pretty-text-wrapper' },
      React.createElement(
        'div',
        { className: textBoxClasses, tabIndex: this.tabIndex(), onFocus: this.onFocusAction, onBlur: this.onBlurAction },
        React.createElement('div', { ref: 'textBox', className: 'internal-text-wrapper' })
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
      readOnly: readOnly ? 'nocursor' : false // 'nocursor' means read only and not focusable
    };

    if (this.props.field.codeMirrorOptions) {
      options = _.extend({}, options, this.props.field.codeMirrorOptions);
    }

    var textBox = this.refs.textBox;
    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on('change', this.onCodeMirrorChange);
  },

  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.refs.textBox;
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
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