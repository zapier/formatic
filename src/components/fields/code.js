'use strict';

/*eslint no-script-url:0 */

import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '@/src/undash';
import FieldMixin from '@/src/mixins/field';
import { ref } from '@/src/utils';

/** @jsx jsx */
import jsx from '@/src/jsx';

/*
  A very trimmed down field that uses CodeMirror for syntax highlighting *only*.
 */
export default createReactClass({
  displayName: 'Code',

  mixins: [FieldMixin],

  componentDidMount: function() {
    this.createCodeMirrorEditor();
  },

  componentWillUnmount: function() {
    this.removeCodeMirrorEditor();
  },

  getInitialState: function() {
    return {
      value: this.props.field.value,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({ value: nextProps.field.value });
  },

  tabIndex: function() {
    if (this.isReadOnly()) {
      return null;
    }
    return this.props.field.tabIndex || 0;
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;
    const props = { typeName: 'Code', field, plain: this.props.plain };

    const textBoxClasses = cx(
      _.extend({}, this.props.classes, { 'pretty-text-box': true })
    );

    // Render read-only version.
    const element = (
      <div
        className="pretty-text-wrapper"
        renderWith={this.renderWith('FieldBody')}
      >
        <div
          className={textBoxClasses}
          onBlur={this.onBlurAction}
          onFocus={this.onFocusAction}
          renderWith={this.renderWith('TabTarget')}
          role="presentation"
          tabIndex={this.tabIndex()}
        >
          <div
            className="internal-text-wrapper"
            ref={ref(this, 'textBox')}
            renderWith={this.renderWith('TextWrapper')}
          />
        </div>
      </div>
    );

    return config.createElement('field', props, element);
  },

  createCodeMirrorEditor: function() {
    const config = this.props.config;
    const field = this.props.field;
    const readOnly = config.fieldIsReadOnly(field);

    let options = {
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
        },
      },
      readOnly: readOnly ? 'nocursor' : false, // 'nocursor' means read only and not focusable
    };

    if (this.props.field.language === 'python') {
      options.indentUnit = 4;
      options.tabSize = 4;
    }

    if (this.props.field.codeMirrorOptions) {
      options = _.extend({}, options, this.props.field.codeMirrorOptions);
    }

    const textBox = this.textBoxRef;
    this.codeMirror = config.codeMirror()(textBox, options);
    const editor = textBox.getElementsByTagName('textarea')[0];
    // Try to set aria-label on code block
    if (editor) {
      editor.setAttribute('aria-label', 'code block');
    }
    this.codeMirror.on('change', this.onCodeMirrorChange);
  },

  removeCodeMirrorEditor: function() {
    const textBoxNode = this.textBoxRef;
    const cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror.off('change', this.onCodeMirrorChange);
    this.codeMirror = null;
  },

  onCodeMirrorChange: function() {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    const newValue = this.codeMirror.getValue();
    this.onChangeValue(newValue);
    this.setState({ value: newValue });
  },
});
