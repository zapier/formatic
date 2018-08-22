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

var _draftJs = require('draft-js');

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var keyBindingFn = function keyBindingFn(event) {
  if (event.key === '@') {
    return 'show-choices';
  }
  return (0, _draftJs.getDefaultKeyBinding)(event);
};

var TagComponent = function TagComponent(_ref) {
  var contentState = _ref.contentState,
      entityKey = _ref.entityKey,
      offsetKey = _ref.offsetKey;

  var data = contentState.getEntity(entityKey).getData();
  var onClick = function onClick() {
    return data.onTagClick(entityKey);
  };
  var tagProps = { onClick: onClick, field: data.field, label: data.label };
  return _react2.default.createElement(
    'span',
    { 'data-offset-key': offsetKey },
    data.config.createElement('pretty-tag', tagProps, data.label)
  );
};

var toString = function toString(value) {
  if (_undash2.default.isUndefined(value) || _undash2.default.isNull(value)) {
    return '';
  }
  return String(value);
};

var findChoice = function findChoice(replaceChoices, tag) {
  return _undash2.default.find(replaceChoices, function (c) {
    return c.value === tag;
  });
};

var getChoiceLabel = function getChoiceLabel(choice, tag, humanize) {
  return choice && (choice.tagLabel || choice.label) || humanize && humanize(tag) || tag;
};

// TODO:
// Do we leave the curlies - '{{firstName}}' - in the text passed to Draft-js?,
// and let the pretty-tag component that gets rendered display the label?
//
// Or instead replace with the labels - 'Tom'?
//
// This commented out method leaves the curlies in, and is simpler, but I had some
// troubles backspacing or deleting long pills that spanned multiple lines when I
// left the curlies in. In either case we have all the data we need in the entities,
// but it does complicate the conversion process to replace with the labels.
// Need to investigate more.

/* const getRawContent1 = (text, replaceChoices, humanize, config, field, onTagClick) => {
 *   const entityRanges = [];
 *   const entityMap = {};
 *
 *   const re = /{{(.+?)}}/g;
 *   let m, offset;
 *   while ((m = re.exec(text)) !== null) {
 *     offset = m.index;
 *     const tag = m[1];
 *     entityRanges.push({offset, length: m[0].length, key: tag});
 *
 *     const choice = findChoice(replaceChoices, tag);
 *     const label = getChoiceLabel(choice, tag, humanize);
 *
 *     entityMap[tag] = {
 *       type: 'TAG',
 *       mutability: 'IMMUTABLE',
 *       data: { tag, label, config, field, onTagClick },
 *     };
 *   }
 *
 *   return {
 *     blocks: [
 *       {
 *         text,
 *         type: 'unstyled',
 *         entityRanges,
 *       }
 *     ],
 *     entityMap
 *   };
 * };*/

var getRawContent = function getRawContent(value, replaceChoices, humanize, config, field, onTagClick) {
  var entityRanges = [];
  var entityMap = {};

  var re = /{{(.+?)}}/g;
  var text = '';
  var lastPos = 0;
  var m = void 0;
  while ((m = re.exec(value)) !== null) {
    text += value.substr(lastPos, m.index - lastPos);
    var offset = text.length;
    var tag = m[1];
    var choice = findChoice(replaceChoices, tag);
    var label = getChoiceLabel(choice, tag, humanize);
    text += label;
    lastPos = re.lastIndex;
    entityRanges.push({ offset: offset, length: label.length, key: tag });
    entityMap[tag] = {
      type: 'TAG',
      mutability: 'IMMUTABLE',
      data: { tag: tag, label: label, config: config, field: field, onTagClick: onTagClick }
    };
  }

  return {
    blocks: [{
      type: 'unstyled',
      text: text,
      entityRanges: entityRanges
    }],
    entityMap: entityMap
  };
};

var findTagEntities = function findTagEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(function (character) {
    var entityKey = character.getEntity();
    if (entityKey === null) {
      return false;
    }
    var entity = contentState.getEntity(entityKey);
    return entity.getType() === 'TAG';
  }, callback);
};

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.

   Uses Draft.js to render text content with pretty tags.
 */
exports.default = (0, _createReactClass2.default)({
  displayName: 'PrettyTextInput',

  mixins: [_helper2.default],

  getInitialState: function getInitialState() {
    var _props = this.props,
        value = _props.value,
        replaceChoices = _props.replaceChoices,
        humanize = _props.humanize,
        config = _props.config,
        field = _props.field;

    var rawContent = getRawContent(toString(value), replaceChoices, humanize, config, field, this.onTagClick);
    var blocks = (0, _draftJs.convertFromRaw)(rawContent);
    var decorator = new _draftJs.CompositeDecorator([{
      strategy: findTagEntities,
      component: TagComponent
    }]);

    var editorState = _draftJs.EditorState.createWithContent(blocks, decorator);

    return {
      isChoicesOpen: false,
      editorState: editorState
    };
  },


  /* Return true if we should render the placeholder */
  hasPlaceholder: function hasPlaceholder() {
    return !this.props.value;
  },
  handleChoiceSelection: function handleChoiceSelection(tag) {
    var _props2 = this.props,
        config = _props2.config,
        field = _props2.field,
        humanize = _props2.humanize,
        replaceChoices = _props2.replaceChoices;
    var _state = this.state,
        editorState = _state.editorState,
        selectedTagEntityKey = _state.selectedTagEntityKey;


    var contentState = editorState.getCurrentContent();

    var blocks = contentState.getBlockMap();
    var entityRange = void 0,
        blockKey = void 0;
    blocks.forEach(function (block) {
      block.findEntityRanges(function (value) {
        return value.get('entity') === selectedTagEntityKey;
      }, function (start, end) {
        blockKey = block.getKey();
        // TODO; not sure why has to be anchorOffset, focusOffset instead of start, end
        entityRange = {
          anchorOffset: start,
          focusOffset: end
        };
      });
    });

    var selectionState = entityRange ? _draftJs.SelectionState.createEmpty(blockKey).merge(entityRange) : editorState.getSelection();

    var choice = findChoice(replaceChoices, tag);
    var label = getChoiceLabel(choice, tag, humanize);

    var contentStateWithReplacedText = _draftJs.Modifier.replaceText(contentState, selectionState, label);
    var contentStateWithEntity = contentStateWithReplacedText.createEntity('TAG', 'IMMUTABLE', { tag: tag, label: label, config: config, field: field, onTagClick: this.onTagClick });

    var currentSelectionState = entityRange ? _draftJs.SelectionState.createEmpty(blockKey) : editorState.getSelection();
    var newSelectionState = currentSelectionState.merge({
      anchorOffset: selectionState.getAnchorOffset(),
      focusOffset: selectionState.getAnchorOffset() + label.length
    });

    var newEntityKey = contentStateWithEntity.getLastCreatedEntityKey();
    var newContentState = _draftJs.Modifier.applyEntity(contentStateWithEntity, newSelectionState, newEntityKey);

    var newEditorState = _draftJs.EditorState.push(editorState, newContentState);

    this.setState({
      editorState: newEditorState,
      isChoicesOpen: false
    });
  },
  onBlur: function onBlur() {
    this.props.onBlur();
  },
  wrapperTabIndex: function wrapperTabIndex() {
    return this.props.tabIndex || 0;
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
  insertBtn: function insertBtn() {
    var _this = this;

    var onInsertClick = function onInsertClick() {
      _this.setState({ selectedTagPos: null });
      _this.onToggleChoices();
    };

    var props = {
      ref: (0, _utils.ref)(this, 'toggle'),
      onClick: onInsertClick.bind(this),
      field: this.props.field
    };
    return this.props.config.createElement('insert-button', props, 'Insert...');
  },
  choices: function choices() {
    return this.props.config.createElement('choices', {
      ref: (0, _utils.ref)(this, 'choices'),
      onFocusSelect: function onFocusSelect() {}, // TODO
      choices: this.props.replaceChoices,
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
  onTagClick: function onTagClick(entityKey) {
    this.setState({ selectedTagEntityKey: entityKey });
    this.onToggleChoices();
  },
  onChangeEditor: function onChangeEditor(editorState) {
    this.setState({ editorState: editorState });
  },
  handleKeyCommand: function handleKeyCommand(command) {
    if (command === 'show-choices') {
      this.setState({ isChoicesOpen: true });
      return 'handled';
    }
    return 'not-handled';
  },
  render: function render() {
    return this.renderWithConfig();
  },
  renderDefault: function renderDefault() {
    var classes = this.props.classes;
    var _state2 = this.state,
        editorState = _state2.editorState,
        isChoicesOpen = _state2.isChoicesOpen;


    var textBoxClasses = (0, _classnames2.default)(_undash2.default.extend({}, classes, {
      'pretty-text-box': true,
      placeholder: this.hasPlaceholder()
    }));

    return _react2.default.createElement(
      'div',
      { onKeyDown: this.onKeyDown,
        className: (0, _classnames2.default)({ 'pretty-text-wrapper': true, 'choices-open': isChoicesOpen }) },
      _react2.default.createElement(
        'div',
        { className: 'pretty-text-click-wrapper', onClick: this.onFocusClick },
        _react2.default.createElement(
          'div',
          { className: textBoxClasses, tabIndex: this.wrapperTabIndex(), onBlur: this.onBlur },
          _react2.default.createElement(
            'div',
            { className: 'internal-text-wrapper' },
            _react2.default.createElement(_draftJs.Editor, {
              editorState: editorState,
              keyBindingFn: keyBindingFn,
              handleKeyCommand: this.handleKeyCommand,
              onChange: this.onChangeEditor })
          )
        )
      ),
      this.insertBtn(),
      this.choices()
    );
  }
});