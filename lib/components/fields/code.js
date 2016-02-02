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

  componentDidMount: function() {
    this.createCodeMirrorEditor();
  },

  componentWillUnmount: function() {
    this.removeCodeMirrorEditor();
  },

  getInitialState: function() {
    return {
      value: this.props.field.value
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({value: nextProps.field.value});
  },

  tabIndex: function () {
    if (this.isReadOnly()) {
      return null;
    }
    return this.props.field.tabIndex || 0;
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };

    var textBoxClasses = cx(_.extend({}, this.props.classes, {'pretty-text-box': true}));

    // Render read-only version.
    var element = (
      <div className="pretty-text-wrapper">
        <div className={textBoxClasses} tabIndex={this.tabIndex()} onFocus={this.onFocusAction} onBlur={this.onBlurAction}>
          <div ref="textBox" className="internal-text-wrapper" />
        </div>
      </div>
    );

    return config.createElement('field', props, element);
  },

  createCodeMirrorEditor: function () {
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
        Tab: function(cm) {
          if (_.any(cm.getSelections(), Boolean)) {
            cm.execCommand('defaultTab');
          } else {
            cm.execCommand('insertSoftTab');
          }
        },
        'Shift-Tab': function(cm) {
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
      options = _.extend({}, options, this.props.field.codeMirrorOptions);
    }

    var textBox = this.refs.textBox;
    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on('change', this.onCodeMirrorChange);
  },

  removeCodeMirrorEditor: function () {
    var textBoxNode = this.refs.textBox;
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror = null;
  },

  onCodeMirrorChange: function () {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    var newValue = this.codeMirror.getValue();
    this.onChangeValue(newValue);
    this.setState({value: newValue});
  }

});
