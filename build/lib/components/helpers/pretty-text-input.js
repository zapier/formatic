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

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _tagTranslator = require('./tag-translator');

var _tagTranslator2 = _interopRequireDefault(_tagTranslator);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _utils = require('../../utils');

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toString = function toString(value) {
  if (_undash2.default.isUndefined(value) || _undash2.default.isNull(value)) {
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
exports.default = (0, _createReactClass2.default)({

  displayName: 'PrettyTextInput',

  mixins: [_helper2.default],

  componentDidMount: function componentDidMount() {
    this.createEditor();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    var hasReplaceChoicesChanged = !_undash2.default.isEqual(prevProps.replaceChoices, this.props.replaceChoices);
    var hasCodeMirrorModeChanged = prevState.codeMirrorMode !== this.state.codeMirrorMode;
    if (hasCodeMirrorModeChanged || hasReplaceChoicesChanged) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
    }
    this.updateEditor();
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.state.codeMirrorMode) {
      this.removeCodeMirrorEditor();
    }
  },

  getInitialState: function getInitialState() {
    var selectedChoices = this.props.selectedChoices;
    var replaceChoices = this.props.replaceChoices;
    var translator = (0, _tagTranslator2.default)(selectedChoices.concat(replaceChoices), this.props.config.humanize);

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

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    // If we're debouncing a change, then we should just ignore this props change,
    // because there will be another when we hit the trailing edge of the debounce.
    if (this.isDebouncingCodeMirrorChange) {
      return;
    }

    var selectedChoices = nextProps.selectedChoices;
    var replaceChoices = nextProps.replaceChoices;
    var nextState = {
      replaceChoices: replaceChoices,
      translator: (0, _tagTranslator2.default)(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    };

    // Not sure what the null/undefined checks are here for, but changed from falsey which was breaking.
    if (this.state.value !== nextProps.value && !_undash2.default.isUndefined(nextProps.value) && nextProps.value !== null) {
      nextState.value = toString(nextProps.value);
      if (this.state.hasChanged === false) {
        nextState.hasChanged = true;
      }
    }

    this.setState(nextState);
  },

  onChange: function onChange(newValue) {
    this.props.onChange(newValue);
  },

  handleChoiceSelection: function handleChoiceSelection(key, event) {
    var _this = this;

    var selectChoice = function selectChoice() {
      var pos = _this.state.selectedTagPos;
      var tag = '{{' + key + '}}';

      _this.isInserting = true;
      if (pos) {
        _this.codeMirror.replaceRange(tag, { line: pos.line, ch: pos.start }, { line: pos.line, ch: pos.stop });
      } else {
        _this.codeMirror.replaceSelection(tag, 'end');
      }
      _this.isInserting = false;
      _this.codeMirror.focus();

      _this.setState({ isChoicesOpen: false, selectedTagPos: null });
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

  onFocusClick: function onFocusClick() {
    this.onFocusWrapper(true);
  },

  onFocusWrapper: function onFocusWrapper(isFromClick) {
    var _this2 = this;

    this.switchToCodeMirror(function () {
      _this2.codeMirror.focus();
      _this2.codeMirror.setCursor(_this2.codeMirror.lineCount(), 0);
    }, function () {
      // If this is from a click, we lose focus, so force it focused!
      if (isFromClick) {
        setTimeout(function () {
          if (_this2.codeMirror && !_this2.codeMirror.state.focused) {
            _this2.codeMirror.focus();
            _this2.codeMirror.setCursor(_this2.codeMirror.lineCount(), 0);
          }
        }, 0);
      }
    });
  },

  focus: function focus() {
    var _this3 = this;

    if (this.codeMirror) {
      this.focusCodeMirror();
    } else {
      this.switchToCodeMirror(function () {
        _this3.focusCodeMirror();
      });
    }
  },
  focusCodeMirror: function focusCodeMirror() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  },
  onFocusCodeMirror: function onFocusCodeMirror() {
    this.setState({ hasFocus: true });
    this.props.onFocus();
  },
  onBlur: function onBlur() {
    if (this.isDebouncingCodeMirrorChange) {
      this.onChangeAndTagCodeMirror();
      this.isDebouncingCodeMirrorChange = false;
      this.setState({ hasFocus: false }, this.props.onBlur);
    } else {
      this.setState({ hasFocus: false });
      this.props.onBlur();
    }
  },


  insertBtn: function insertBtn() {
    if (this.isReadOnly() && !this.hasReadOnlyControls()) {
      return null;
    }

    var onInsertClick = function onInsertClick() {
      this.setState({ selectedTagPos: null });
      this.onToggleChoices();
    };

    var props = {
      ref: (0, _utils.ref)(this, 'toggle'),
      onClick: onInsertClick.bind(this),
      readOnly: this.isReadOnly(),
      field: this.props.field
    };
    return this.props.config.createElement('insert-button', props, 'Insert...');
  },

  choices: function choices() {
    if (this.isReadOnly()) {
      return null;
    }

    return this.props.config.createElement('choices', {
      ref: (0, _utils.ref)(this, 'choices'),
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

  onChoiceAction: function onChoiceAction(choice) {
    this.setState({
      isChoicesOpen: !!choice.isOpen
    });
    this.onStartAction(choice.action, choice);
  },

  wrapperTabIndex: function wrapperTabIndex() {
    if (this.props.readOnly || this.state.codeMirrorMode) {
      return null;
    }
    return this.props.tabIndex || 0;
  },
  onKeyDown: function onKeyDown(event) {
    if (!this.isReadOnly()) {
      if (event.keyCode === _utils.keyCodes.ESC) {
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


  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var textBoxClasses = (0, _classnames2.default)(_undash2.default.extend({}, this.props.classes, {
      'pretty-text-box': true,
      placeholder: this.hasPlaceholder(),
      'has-focus': this.state.hasFocus
    }));

    // Render read-only version.
    return _react2.default.createElement(
      'div',
      { onKeyDown: this.onKeyDown, className: (0, _classnames2.default)({ 'pretty-text-wrapper': true, 'choices-open': this.state.isChoicesOpen }),
        onMouseEnter: this.switchToCodeMirror, onTouchStart: this.switchToCodeMirror },
      _react2.default.createElement(
        'div',
        { className: 'pretty-text-click-wrapper', onClick: this.onFocusClick },
        _react2.default.createElement(
          'div',
          { className: textBoxClasses, tabIndex: this.wrapperTabIndex(), onFocus: this.onFocusWrap, onBlur: this.onBlur },
          _react2.default.createElement('div', { ref: (0, _utils.ref)(this, 'textBox'), className: 'internal-text-wrapper' })
        )
      ),
      this.insertBtn(),
      this.choices()
    );
  },

  getCloseIgnoreNodes: function getCloseIgnoreNodes() {
    return this.toggleRef;
  },

  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? 'open-replacements' : 'close-replacements';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onCloseChoices: function onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  createEditor: function createEditor() {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  updateEditor: function updateEditor() {
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

  createCodeMirrorEditor: function createCodeMirrorEditor() {
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

  tagCodeMirror: function tagCodeMirror() {
    var _this4 = this;

    var positions = this.state.translator.getTagPositions(this.codeMirror.getValue());
    var self = this;

    var tagOps = function tagOps() {
      positions.forEach(function (pos) {
        var node = self.createTagNode(pos);
        self.codeMirror.markText({ line: pos.line, ch: pos.start }, { line: pos.line, ch: pos.stop }, { replacedWith: node, handleMouseEvents: true });
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
    } else {
      requestAnimationFrame(function () {
        _this4.codeMirror.operation(tagOps);
      });
    }
  },

  onChangeAndTagCodeMirror: function onChangeAndTagCodeMirror() {
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


  onCodeMirrorChange: function onCodeMirrorChange() {
    var _this5 = this;

    var newValue = this.codeMirror.getValue();
    this.setState({ value: newValue });

    // Immediately change and tag if inserting.
    if (this.isInserting) {
      this.onChangeAndTagCodeMirror();
      return;
    }

    // Otherwise, debounce so CodeMirror doesn't die.
    if (!this.debounceCodeMirrorChange) {
      this.debounceCodeMirrorChange = _undash2.default.debounce(function () {
        if (_this5.isDebouncingCodeMirrorChange) {
          _this5.onChangeAndTagCodeMirror();
          _this5.isDebouncingCodeMirrorChange = false;
        }
      }, 200);
    }
    this.isDebouncingCodeMirrorChange = true;
    this.debounceCodeMirrorChange();
  },

  /* Return true if we should render the placeholder */
  hasPlaceholder: function hasPlaceholder() {
    return !this.state.value;
  },

  createReadonlyEditor: function createReadonlyEditor() {
    var textBoxNode = this.textBoxRef;

    if (this.hasPlaceholder()) {
      return _reactDom2.default.render(_react2.default.createElement(
        'span',
        null,
        this.props.field.placeholder
      ), textBoxNode);
    }

    var tokens = this.props.config.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part, i) {
      if (part.type === 'tag') {
        var label = self.state.translator.getLabel(part.value);
        var props = { key: i, tag: part.value, replaceChoices: self.state.replaceChoices, field: self.props.field };
        return self.props.config.createElement('pretty-tag', props, label);
      }
      return _react2.default.createElement(
        'span',
        { key: i },
        part.value
      );
    });

    return _reactDom2.default.render(_react2.default.createElement(
      'span',
      null,
      nodes
    ), textBoxNode);
  },

  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.textBoxRef;
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror.off('change', this.onCodeMirrorChange);
    this.codeMirror.off('focus', this.onFocusCodeMirror);
    this.codeMirror = null;
  },

  switchToCodeMirror: function switchToCodeMirror(cb, alreadySwitchedCb) {
    var _this6 = this;

    if (this.isReadOnly()) {
      return; // never render in code mirror if read-only
    }

    if (!this.props.readOnly) {
      if (!this.state.codeMirrorMode) {
        this.setState({ codeMirrorMode: true }, function () {
          if (_this6.codeMirror && _undash2.default.isFunction(cb)) {
            cb();
          }
        });
      } else {
        if (_undash2.default.isFunction(alreadySwitchedCb)) {
          alreadySwitchedCb();
        }
      }
    }
  },

  onTagClick: function onTagClick() {
    var cursor = this.codeMirror.getCursor();
    var pos = this.state.translator.getTrueTagPosition(this.state.value, cursor);

    this.setState({ selectedTagPos: pos });
    this.onToggleChoices();
  },

  createTagNode: function createTagNode(pos) {
    var node = document.createElement('span');
    var label = this.state.translator.getLabel(pos.tag);
    var config = this.props.config;

    var props = { onClick: this.onTagClick, field: this.props.field, tag: pos.tag };

    _reactDom2.default.render(config.createElement('pretty-tag', props, label), node);

    return node;
  }
});