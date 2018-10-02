'use strict';

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

var _clickOutside = require('../../mixins/click-outside');

var _clickOutside2 = _interopRequireDefault(_clickOutside);

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
 */
exports.default = (0, _createReactClass2.default)({
  displayName: 'PrettyTextInput',

  mixins: [_helper2.default, _clickOutside2.default],

  componentDidMount: function componentDidMount() {
    this.setOnClickOutside('inputContainer', this.onClickOutside);
  },

  componentWillUnmount: function componentWillUnmount() {
    this.textareaRef = null;
  },
  onClickOutside: function onClickOutside() {
    if (this.textareaRef) {
      this.setState({ isEditing: false });
    }
  },


  getInitialState: function getInitialState() {
    var selectedChoices = this.props.selectedChoices;
    var replaceChoices = this.props.replaceChoices;
    var translator = (0, _tagTranslator2.default)(selectedChoices.concat(replaceChoices), this.props.config.humanize);

    return {
      // With number values, onFocus never fires, which means it stays read-only. So convert to string.
      value: toString(this.props.value),
      isEditing: false,
      isChoicesOpen: false,
      translator: translator,
      replaceChoices: replaceChoices
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var selectedChoices = nextProps.selectedChoices;
    var replaceChoices = nextProps.replaceChoices;
    var nextState = {
      replaceChoices: replaceChoices,
      translator: (0, _tagTranslator2.default)(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    };

    // Not sure what the null/undefined checks are here for, but changed from falsey which was breaking.
    if (this.state.value !== nextProps.value && !_undash2.default.isUndefined(nextProps.value) && nextProps.value !== null) {
      nextState.value = toString(nextProps.value);
    }

    this.setState(nextState);
  },

  onChange: function onChange(newValue) {
    this.props.onChange(newValue.target.value);
  },

  handleChoiceSelection: function handleChoiceSelection(key, event) {
    var _this = this;

    var textarea = this.textareaRef;
    var value = this.state.value;


    var selectChoice = function selectChoice() {
      // Not worrying about actual selections right now la la la...
      // Assuming no selection.
      var pos = textarea.selectionStart;
      var tag = '{{' + key + '}}';

      var newValue = value.substr(0, pos) + tag + value.substr(pos);

      _this.setState({
        isChoicesOpen: false,
        selectedTagPos: null,
        value: newValue
      });
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

  onFocusClick: function onFocusClick() {
    this.switchToTextarea();
  },

  focus: function focus() {
    if (this.isEditing) {
      this.focusTextarea();
    } else {
      this.switchToTextarea();
    }
  },
  focusTextarea: function focusTextarea() {
    if (this.textareaRef) {
      this.textareaRef.focus();
    }
  },
  onBlur: function onBlur() {
    /* if (this.isDebouncingCodeMirrorChange) {
     *   //this.onChangeAndTagCodeMirror();
     *   this.isDebouncingCodeMirrorChange = false;
     *   this.setState({ hasFocus: false }, this.props.onBlur);
     * } else {
     *   this.setState({ hasFocus: false });
     *   this.props.onBlur();
     * }*/
    this.setState({ hasFocus: false, isEditing: true });
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
      onFocusSelect: this.focusTextarea,
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
    if (this.props.readOnly || this.state.isEditing) {
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
  switchToTextarea: function switchToTextarea() {
    var _this2 = this;

    this.setState({ isEditing: true }, function () {
      _this2.focusTextarea();
    });
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

    var editor = this.state.isEditing ? _react2.default.createElement('textarea', {
      className: textBoxClasses,
      value: this.state.value,
      tabIndex: this.wrapperTabIndex(),
      onBlur: this.onBlur,
      onChange: this.onChange,
      onKeyDown: this.onTextareaKeyDown,
      onKeyUp: this.onTextareaKeyUp,
      ref: (0, _utils.ref)(this, 'textarea')
    }) : _react2.default.createElement(
      'div',
      {
        className: textBoxClasses,
        tabIndex: this.wrapperTabIndex(),
        onBlur: this.onBlur,
        ref: (0, _utils.ref)(this, 'textBox')
      },
      this.createReadonlyEditor()
    );

    // Render read-only version.
    return _react2.default.createElement(
      'div',
      {
        onKeyDown: this.onKeyDown,
        className: (0, _classnames2.default)({
          'pretty-text-wrapper': true,
          'choices-open': this.state.isChoicesOpen
        }),
        onTouchStart: this.switchToTextarea,
        ref: (0, _utils.ref)(this, 'inputContainer')
      },
      _react2.default.createElement(
        'div',
        {
          className: 'pretty-text-click-wrapper',
          tabIndex: '0'
          // we need to handle onFocus events for this div for accessibility
          // when the screen reader enters the field it should be the equivalent
          // of a focus click event
          , onFocus: this.onFocusClick,
          role: 'textbox'
        },
        editor
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
    if (this.state.isEditing) {
      /*       this.createCodeMirrorEditor();*/
      this.createTextarea();
    } else {
      this.createReadonlyEditor();
    }
  },

  updateEditor: function updateEditor() {
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

  maybeSetCursorPosition: function maybeSetCursorPosition(position) {
    if (position && this.codeMirror) {
      //this.codeMirror.setCursor(position);
    }
  },


  /* Return true if we should render the placeholder */
  hasPlaceholder: function hasPlaceholder() {
    return !this.state.value;
  },

  createReadonlyEditor: function createReadonlyEditor() {
    if (this.hasPlaceholder()) {
      return _react2.default.createElement(
        'span',
        null,
        this.props.field.placeholder
      );
    }

    var tokens = this.props.config.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part, i) {
      if (part.type === 'tag') {
        var label = self.state.translator.getLabel(part.value);
        var props = {
          key: i,
          tag: part.value,
          replaceChoices: self.state.replaceChoices,
          field: self.props.field
        };
        return self.props.config.createElement('pretty-tag', props, label);
      }
      return _react2.default.createElement(
        'span',
        { key: i },
        part.value
      );
    });

    //return ReactDOM.render(<span>{nodes}</span>, textBoxNode);
    return _react2.default.createElement(
      'span',
      null,
      nodes
    );
  },

  onTextareaKeyDown: function onTextareaKeyDown(event) {
    if (event.shiftKey && event.keyCode === _utils.keyCodes['2']) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({ isChoicesOpen: true });
    }
  },
  createTextarea: function createTextarea() {
    return _react2.default.createElement('textarea', {
      ref: (0, _utils.ref)(this, 'textarea'),
      className: 'pretty-text-textarea',
      value: this.state.value,
      onChange: this.onChange,
      onKeyDown: this.onTextareaKeyDown,
      onKeyUp: this.onTextareaKeyUp
    });
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

    var props = {
      onClick: this.onTagClick,
      field: this.props.field,
      tag: pos.tag
    };

    _reactDom2.default.render(config.createElement('pretty-tag', props, label), node);

    return node;
  }
});