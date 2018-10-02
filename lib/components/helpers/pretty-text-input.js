'use strict';

/*eslint no-script-url:0 */

import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import TagTranslator from './tag-translator';
import _ from '../../undash';
import { keyCodes, ref } from '../../utils';
import HelperMixin from '../../mixins/helper';
import ClickOutsideMixin from '../../mixins/click-outside';

var toString = function(value) {
  if (_.isUndefined(value) || _.isNull(value)) {
    return '';
  }
  return String(value);
};

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.
 */
export default createReactClass({
  displayName: 'PrettyTextInput',

  mixins: [HelperMixin, ClickOutsideMixin],

  componentDidMount: function() {
    this.setOnClickOutside('inputContainer', this.onClickOutside);
  },

  componentWillUnmount() {
    this.textareaRef = null;
  },

  onClickOutside() {
    if (this.textareaRef) {
      this.setState({ isEditing: false });
    }
  },

  getInitialState: function() {
    const selectedChoices = this.props.selectedChoices;
    const replaceChoices = this.props.replaceChoices;
    const translator = TagTranslator(
      selectedChoices.concat(replaceChoices),
      this.props.config.humanize
    );

    return {
      // With number values, onFocus never fires, which means it stays read-only. So convert to string.
      value: toString(this.props.value),
      isEditing: false,
      isChoicesOpen: false,
      translator,
      replaceChoices: replaceChoices,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    const selectedChoices = nextProps.selectedChoices;
    const replaceChoices = nextProps.replaceChoices;
    const nextState = {
      replaceChoices: replaceChoices,
      translator: TagTranslator(
        selectedChoices.concat(replaceChoices),
        this.props.config.humanize
      ),
    };

    // Not sure what the null/undefined checks are here for, but changed from falsey which was breaking.
    if (
      this.state.value !== nextProps.value &&
      !_.isUndefined(nextProps.value) &&
      nextProps.value !== null
    ) {
      nextState.value = toString(nextProps.value);
    }

    this.setState(nextState);
  },

  onChange: function(newValue) {
    this.props.onChange(newValue.target.value);
  },

  handleChoiceSelection: function(key, event) {
    const textarea = this.textareaRef;
    const { value } = this.state;

    const selectChoice = () => {
      // Not worrying about actual selections right now la la la...
      // Assuming no selection.
      const pos = textarea.selectionStart;
      const tag = '{{' + key + '}}';

      const newValue = value.substr(0, pos) + tag + value.substr(pos);

      this.setState({
        isChoicesOpen: false,
        selectedTagPos: null,
        value: newValue,
      }, () => this.props.onChange(newValue));
    };
    if (this.state.isEditing) {
      selectChoice();
    } else if (this.props.readOnly) {
      // hackety hack to stop dropdown choices from toggling
      event.stopPropagation();
      this.isInserting = true;
      this.onChange('{{' + key + '}}');
      this.isInserting = false;
      this.setState({ isChoicesOpen: false });
    } else {
      this.switchToTextarea(selectChoice);
    }
  },

  onFocusClick: function() {
    this.switchToTextarea();
  },

  focus() {
    if (this.isEditing) {
      this.focusTextarea();
    } else {
      this.switchToTextarea();
    }
  },

  focusTextarea() {
    if (this.textareaRef) {
      this.textareaRef.focus();
    }
  },

  onBlur() {
    this.setState({ hasFocus: false }, this.props.onBlur);
  },

  insertBtn: function() {
    if (this.isReadOnly() && !this.hasReadOnlyControls()) {
      return null;
    }
    var onInsertClick = function() {
      this.setState({ selectedTagPos: null });
      this.onToggleChoices();
    };

    const props = {
      ref: ref(this, 'toggle'),
      onClick: onInsertClick.bind(this),
      readOnly: this.isReadOnly(),
      field: this.props.field,
    };
    return this.props.config.createElement('insert-button', props, 'Insert...');
  },

  choices: function() {
    if (this.isReadOnly()) {
      return null;
    }

    return this.props.config.createElement('choices', {
      ref: ref(this, 'choices'),
      onFocusSelect: this.focusTextarea,
      choices: this.state.replaceChoices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.handleChoiceSelection,
      onClose: this.onCloseChoices,
      isAccordion: this.props.isAccordion,
      field: this.props.field,
      onChoiceAction: this.onChoiceAction,
    });
  },

  onChoiceAction: function(choice) {
    this.setState({
      isChoicesOpen: !!choice.isOpen,
    });
    this.onStartAction(choice.action, choice);
  },

  wrapperTabIndex() {
    if (this.props.readOnly || this.state.isEditing) {
      return null;
    }
    return this.props.tabIndex || 0;
  },

  onKeyDown(event) {
    if (!this.isReadOnly()) {
      if (event.keyCode === keyCodes.ESC) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.isChoicesOpen) {
          this.onToggleChoices();
          this.focusTextarea();
        }
      } else if (!this.state.isChoicesOpen) {
        // TODO: sane shortcut for opening choices
        // Below does not work yet. Ends up dumping { into search input.
        // if (this.codeMirror) {
        //   if (event.keyCode === keyCodes['['] && event.shiftKey) {
        //     const cursor = this.codeMirror.getCursor();
        //     const value = this.codeMirror.getValue();
        //     const lines = value.split('\n');
        //     const line = lines[cursor.line];
        //     if (line) {
        //       const prevChar = line[cursor.ch - 1];
        //       if (prevChar === '{') {
        //         this.onToggleChoices();
        //       }
        //     }
        //   }
        // }
      } else {
        if (this.choicesRef && this.choicesRef.onKeyDown) {
          this.choicesRef.onKeyDown(event);
        }
      }
    }
  },

  switchToTextarea() {
    this.setState({ isEditing: true }, () => {
      this.focusTextarea();
    });
  },

  getTextAreaValue() {
    if (this.state.isEditing) {
      return this.props.config.formatTextValue(this.state.value);
    }
    return this.state.value;
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    var textBoxClasses = cx(
      _.extend({}, this.props.classes, {
        'pretty-text-box': true,
        placeholder: this.hasPlaceholder(),
        'has-focus': this.state.hasFocus,
      })
    );

    const editor = this.state.isEditing ? (
      <textarea
        className={textBoxClasses}
        value={this.getTextAreaValue()}
        tabIndex={this.wrapperTabIndex()}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onKeyDown={this.onTextareaKeyDown}
        onKeyUp={this.onTextareaKeyUp}
        ref={ref(this, 'textarea')}
      />
    ) : (
      <div
        className={textBoxClasses}
        tabIndex={this.wrapperTabIndex()}
        onBlur={this.onBlur}
        ref={ref(this, 'textBox')}
      >
        {this.createReadonlyEditor()}
      </div>
    );

    // Render read-only version.
    return (
      <div
        onKeyDown={this.onKeyDown}
        className={cx({
          'pretty-text-wrapper': true,
          'choices-open': this.state.isChoicesOpen,
        })}
        onTouchStart={this.switchToTextarea}
        ref={ref(this, 'inputContainer')}
      >
        <div
          className="pretty-text-click-wrapper"
          tabIndex="0"
          // we need to handle onFocus events for this div for accessibility
          // when the screen reader enters the field it should be the equivalent
          // of a focus click event
          onFocus={this.onFocusClick}
          role="textbox"
        >
          {editor}

        </div>
        {this.insertBtn()}
        {this.choices()}
      </div>
    );
  },

  getCloseIgnoreNodes: function() {
    return this.toggleRef;
  },

  onToggleChoices: function() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function(isOpen) {
    var action = isOpen ? 'open-replacements' : 'close-replacements';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onCloseChoices: function() {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  createEditor: function() {
    if (this.state.isEditing) {
      /*       this.createCodeMirrorEditor();*/
      this.createTextarea();
    } else {
      this.createReadonlyEditor();
    }
  },

  updateEditor: function() {
    if (this.state.isEditing) {
      /* var codeMirrorValue = this.codeMirror.getValue();
       * if (!this.hasPlaceholder() && codeMirrorValue !== this.state.value) {
       *   // switch back to read-only mode to make it easier to render
       *   this.removeCodeMirrorEditor();
       *   this.createReadonlyEditor();
       *   this.setState({
       *     isEditing: false
       *   });
       * }*/
    } else {
      this.createReadonlyEditor();
    }
  },

  maybeSetCursorPosition(position) {
    if (position && this.codeMirror) {
      //this.codeMirror.setCursor(position);
    }
  },

  /* Return true if we should render the placeholder */
  hasPlaceholder: function() {
    return !this.state.value;
  },

  createReadonlyEditor: function() {
    if (this.hasPlaceholder()) {
      return <span>{this.props.field.placeholder}</span>;
    }

    var tokens = this.props.config.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function(part, i) {
      if (part.type === 'tag') {
        var label = self.state.translator.getLabel(part.value);
        var props = {
          key: i,
          tag: part.value,
          replaceChoices: self.state.replaceChoices,
          field: self.props.field,
        };
        return self.props.config.createElement('pretty-tag', props, label);
      }
      return <span key={i}>{part.value}</span>;
    });

    //return ReactDOM.render(<span>{nodes}</span>, textBoxNode);
    return <span>{nodes}</span>;
  },

  onTextareaKeyDown(event) {
    if (event.shiftKey && event.keyCode === keyCodes['2']) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({ isChoicesOpen: true });
    }
  },

  onTagClick: function() {
    const cursor = this.codeMirror.getCursor();
    const pos = this.state.translator.getTrueTagPosition(
      this.state.value,
      cursor
    );

    this.setState({ selectedTagPos: pos });
    this.onToggleChoices();
  },

  createTagNode: function(pos) {
    const node = document.createElement('span');
    const label = this.state.translator.getLabel(pos.tag);
    const config = this.props.config;

    const props = {
      onClick: this.onTagClick,
      field: this.props.field,
      tag: pos.tag,
    };

    ReactDOM.render(config.createElement('pretty-tag', props, label), node);

    return node;
  },
});
