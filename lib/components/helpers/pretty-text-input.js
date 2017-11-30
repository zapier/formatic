'use strict';

/* global CodeMirror */
/*eslint no-script-url:0 */

import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import TagTranslator from './tag-translator';
import _ from '../../undash';
import {keyCodes, ref} from '../../utils';
import HelperMixin from '../../mixins/helper';

var toString = function (value) {
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

   Uses CodeMirror to edit text. To save memory the CodeMirror node is
   instantiated when the user moves the mouse into the edit area.
   Initially a read-only view using a simple div is shown.
 */
export default createReactClass({

  displayName: 'PrettyTextInput',

  mixins: [HelperMixin],

  componentDidMount: function() {
    this.createEditor();
  },

  componentDidUpdate: function(prevProps, prevState) {
    const hasReplaceChoicesChanged = prevProps.replaceChoices !== this.props.replaceChoices;
    const hasCodeMirrorModeChanged = prevState.codeMirrorMode !== this.state.codeMirrorMode;
    if (hasCodeMirrorModeChanged || hasReplaceChoicesChanged) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
    }
    this.updateEditor();
  },

  componentWillUnmount: function() {
    if (this.state.codeMirrorMode) {
      this.removeCodeMirrorEditor();
    }
  },

  getInitialState: function() {
    var selectedChoices = this.props.selectedChoices;
    var replaceChoices = this.props.replaceChoices;
    var translator = TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize);

    return {
      // With number values, onFocus never fires, which means it stays read-only. So convert to string.
      value: toString(this.props.value),
      codeMirrorMode: false,
      isChoicesOpen: false,
      replaceChoices: replaceChoices,
      translator: translator,
      hasChanged: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // If we're debouncing a change, then we should just ignore this props change,
    // because there will be another when we hit the trailing edge of the debounce.
    if (this.isDebouncingCodeMirrorChange) {
      return;
    }

    var selectedChoices = nextProps.selectedChoices;
    var replaceChoices = nextProps.replaceChoices;
    var nextState = {
      replaceChoices: replaceChoices,
      translator: TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    };

    // Not sure what the null/undefined checks are here for, but changed from falsey which was breaking.
    if (this.state.value !== nextProps.value && !_.isUndefined(nextProps.value) && nextProps.value !== null) {
      nextState.value = toString(nextProps.value);
      if (this.state.hasChanged === false) {
        nextState.hasChanged = true;
      }
    }

    this.setState(nextState);
  },

  onChange: function (newValue) {
    this.props.onChange(newValue);
  },

  handleChoiceSelection: function (key, event) {
    const selectChoice = () => {
      var pos = this.state.selectedTagPos;
      var tag = '{{' + key + '}}';

      this.isInserting = true;
      if (pos) {
        this.codeMirror.replaceRange(tag, {line: pos.line, ch: pos.start}, {line: pos.line, ch: pos.stop});
      } else {
        this.codeMirror.replaceSelection(tag, 'end');
      }
      this.isInserting = false;
      this.codeMirror.focus();

      this.setState({ isChoicesOpen: false, selectedTagPos: null });
    };
    if (this.state.codeMirrorMode) {
      selectChoice();
    } else if (this.props.readOnly) {
      // hackety hack to stop dropdown choices from toggling
      event.stopPropagation();
      this.isInserting = true;
      this.onChange('{{' + key + '}}');
      this.isInserting = false;
      this.setState({ isChoicesOpen: false });
    } else {
      this.switchToCodeMirror(selectChoice);
    }
  },

  onFocusClick: function () {
    this.onFocusWrapper(true);
  },

  onFocusWrapper: function (isFromClick) {
    this.switchToCodeMirror(() => {
      this.codeMirror.focus();
      this.codeMirror.setCursor(this.codeMirror.lineCount(), 0);
    }, () => {
      // If this is from a click, we lose focus, so force it focused!
      if (isFromClick) {
        setTimeout(() => {
          if (this.codeMirror && !this.codeMirror.state.focused) {
            this.codeMirror.focus();
            this.codeMirror.setCursor(this.codeMirror.lineCount(), 0);
          }
        }, 0);
      }
    });
  },

  focus() {
    if (this.codeMirror) {
      this.focusCodeMirror();
    } else {
      this.switchToCodeMirror(() => {
        this.focusCodeMirror();
      });
    }
  },

  focusCodeMirror() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  },

  onFocusCodeMirror() {
    this.setState({ hasFocus: true });
    this.props.onFocus();
  },

  onBlur() {
    if (this.isDebouncingCodeMirrorChange) {
      this.onChangeAndTagCodeMirror();
      this.isDebouncingCodeMirrorChange = false;
      this.setState({ hasFocus: false }, this.props.onBlur);
    } else {
      this.setState({ hasFocus: false });
      this.props.onBlur();
    }
  },

  insertBtn: function () {
    if (this.isReadOnly() && !this.hasReadOnlyControls()) {
      return null;
    }

    var onInsertClick = function () {
      this.setState({selectedTagPos: null});
      this.onToggleChoices();
    };

    const props = {
      ref: ref(this, 'toggle'),
      onClick: onInsertClick.bind(this),
      readOnly: this.isReadOnly(),
      field: this.props.field
    };
    return this.props.config.createElement('insert-button', props, 'Insert...');
  },

  choices: function () {
    if (this.isReadOnly()) {
      return null;
    }

    return this.props.config.createElement('choices', {
      ref: ref(this, 'choices'),
      onFocusSelect: this.focusCodeMirror,
      choices: this.state.replaceChoices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.handleChoiceSelection,
      onClose: this.onCloseChoices,
      isAccordion: this.props.isAccordion,
      field: this.props.field,
      onChoiceAction: this.onChoiceAction
    });
  },

  onChoiceAction: function (choice) {
    this.setState({
      isChoicesOpen: !!choice.isOpen
    });
    this.onStartAction(choice.action, choice);
  },

  wrapperTabIndex() {
    if (this.props.readOnly || this.state.codeMirrorMode) {
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
          this.focusCodeMirror();
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

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var textBoxClasses = cx(_.extend({}, this.props.classes, {
      'pretty-text-box': true,
      placeholder: this.hasPlaceholder(),
      'has-focus': this.state.hasFocus
    }));

    // Render read-only version.
    return (
      <div onKeyDown={this.onKeyDown} className={cx({'pretty-text-wrapper': true, 'choices-open': this.state.isChoicesOpen})}
           onMouseEnter={this.switchToCodeMirror} onTouchStart={this.switchToCodeMirror}>
        <div className="pretty-text-click-wrapper" onClick={this.onFocusClick}>
          <div className={textBoxClasses} tabIndex={this.wrapperTabIndex()} onFocus={this.onFocusWrap} onBlur={this.onBlur}>
            <div ref={ref(this, 'textBox')} className="internal-text-wrapper" />
          </div>
        </div>
        {this.insertBtn()}
        {this.choices()}
      </div>
    );
  },

  getCloseIgnoreNodes: function () {
    return this.toggleRef;
  },

  onToggleChoices: function () {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function (isOpen) {
    var action = isOpen ? 'open-replacements' : 'close-replacements';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onCloseChoices: function () {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  createEditor: function () {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  updateEditor: function () {
    if (this.state.codeMirrorMode) {
      var codeMirrorValue = this.codeMirror.getValue();
      if (!this.hasPlaceholder() && codeMirrorValue !== this.state.value) {
        // switch back to read-only mode to make it easier to render
        this.removeCodeMirrorEditor();
        this.createReadonlyEditor();
        this.setState({
          codeMirrorMode: false
        });
      }
    } else {
      this.createReadonlyEditor();
    }
  },

  createCodeMirrorEditor: function () {
    var options = {
      tabindex: this.props.tabIndex || 0,
      lineWrapping: true,
      placeholder: toString(this.props.config.fieldPlaceholder(this.props.field)),
      value: toString(this.state.value),
      readOnly: false,
      mode: null,
      extraKeys: {
        Tab: false,
        'Shift-Tab': false
      }
    };

    var textBox = this.textBoxRef;
    textBox.innerHTML = ''; // release any previous read-only content so it can be GC'ed

    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on('change', this.onCodeMirrorChange);
    this.codeMirror.on('focus', this.onFocusCodeMirror);

    this.tagCodeMirror();
  },

  tagCodeMirror: function () {
    var positions = this.state.translator.getTagPositions(this.codeMirror.getValue());
    var self = this;

    var tagOps = function () {
      positions.forEach(function (pos) {
        var node = self.createTagNode(pos);
        self.codeMirror.markText({line: pos.line, ch: pos.start},
                                 {line: pos.line, ch: pos.stop},
                                 {replacedWith: node, handleMouseEvents: true});
      });
    };

    // Make sure we apply those operations after React has made its rendering pass.
    // As React 16 is asynchronous and uses rAF, it's safe to assume that this will
    // be called after React has patched the DOM.
    //
    // But if we are calling this function from CodeMirror itself, we want to stay
    // in sync with it's internal state.
    if (this.isDebouncingCodeMirrorChange) {
      this.codeMirror.operation(tagOps);
    }
    else {
      requestAnimationFrame(() => {
        this.codeMirror.operation(tagOps);
      });
    }
  },

  onChangeAndTagCodeMirror() {
    if (!this.codeMirror) {
      // We might have erased our codemirror instance before hitting the trailing
      // end of the debounce. If so, get the value out of state.
      if (this.props.value !== this.state.value) {
        this.onChange(this.state.value);
      }
      return;
    }
    this.onChange(this.codeMirror.getValue());
    this.tagCodeMirror();
  },

  onCodeMirrorChange: function () {
    var newValue = this.codeMirror.getValue();
    this.setState({value: newValue});

    // Immediately change and tag if inserting.
    if (this.isInserting) {
      this.onChangeAndTagCodeMirror();
      return;
    }

    // Otherwise, debounce so CodeMirror doesn't die.
    if (!this.debounceCodeMirrorChange) {
      this.debounceCodeMirrorChange = _.debounce(() => {
        if (this.isDebouncingCodeMirrorChange) {
          this.onChangeAndTagCodeMirror();
          this.isDebouncingCodeMirrorChange = false;
        }
      }, 200);
    }
    this.isDebouncingCodeMirrorChange = true;
    this.debounceCodeMirrorChange();
  },

  /* Return true if we should render the placeholder */
  hasPlaceholder: function () {
    return !this.state.value;
  },

  createReadonlyEditor: function () {
    var textBoxNode = this.textBoxRef;

    if (this.hasPlaceholder()) {
      return ReactDOM.render(<span>{this.props.field.placeholder}</span>, textBoxNode);
    }

    var tokens = this.props.config.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part, i) {
      if (part.type === 'tag') {
        var label = self.state.translator.getLabel(part.value);
        var props = {key: i, tag: part.value, replaceChoices: self.state.replaceChoices, field: self.props.field};
        return self.props.config.createElement('pretty-tag', props, label);
      }
      return <span key={i}>{part.value}</span>;
    });

    return ReactDOM.render(<span>{nodes}</span>, textBoxNode);
  },

  removeCodeMirrorEditor: function () {
    var textBoxNode = this.textBoxRef;
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror = null;
  },

  switchToCodeMirror: function (cb, alreadySwitchedCb) {
    if (this.isReadOnly()) {
      return; // never render in code mirror if read-only
    }

    if (!this.props.readOnly) {
      if (!this.state.codeMirrorMode) {
        this.setState({codeMirrorMode: true}, () => {
          if (this.codeMirror && _.isFunction(cb)) {
            cb();
          }
        });
      } else {
        if (_.isFunction(alreadySwitchedCb)) {
          alreadySwitchedCb();
        }
      }
    }
  },

  onTagClick: function () {
    const cursor = this.codeMirror.getCursor();
    const pos = this.state.translator.getTrueTagPosition(this.state.value, cursor);

    this.setState({selectedTagPos: pos});
    this.onToggleChoices();
  },

  createTagNode: function (pos) {
    var node = document.createElement('span');
    var label = this.state.translator.getLabel(pos.tag);
    var config = this.props.config;

    var props = {onClick: this.onTagClick, field: this.props.field, tag: pos.tag};

    ReactDOM.render(
      config.createElement('pretty-tag', props, label),
      node
    );

    return node;
  }
});
