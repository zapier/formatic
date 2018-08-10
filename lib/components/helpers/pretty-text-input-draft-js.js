'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';
import {
  convertFromRaw,
  /* convertToRaw,*/
  getDefaultKeyBinding,
  CompositeDecorator,
  Editor,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';

import _ from '../../undash';
import HelperMixin from '../../mixins/helper';
import { ref } from '../../utils';

const keyBindingFn = (event) => {
  if (event.key === '@') {
    return 'show-choices';
  }
  return getDefaultKeyBinding(event);
};

const TagComponent = ({contentState, entityKey, offsetKey}) => {
  const data = contentState.getEntity(entityKey).getData();
  const onClick = () => data.onTagClick(entityKey);
  const tagProps = {onClick, field: data.field, label: data.label};
  return (
    <span data-offset-key={offsetKey}>
      {data.config.createElement('pretty-tag', tagProps, data.label)}
    </span>
  );
};

const toString = (value) => {
  if (_.isUndefined(value) || _.isNull(value)) {
    return '';
  }
  return String(value);
};

const findChoice = (replaceChoices, tag) => _.find(replaceChoices, (c) => c.value === tag);

const getChoiceLabel = (choice, tag, humanize) => (
  (choice && (choice.tagLabel || choice.label)) ||
  (humanize && humanize(tag)) ||
  tag
);

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

const getRawContent = (value, replaceChoices, humanize, config, field, onTagClick) => {
  const entityRanges = [];
  const entityMap = {};

  const re = /{{(.+?)}}/g;
  let text = '';
  let lastPos = 0;
  let m;
  while ((m = re.exec(value)) !== null) {
    text += value.substr(lastPos, m.index - lastPos);
    const offset = text.length;
    const tag = m[1];
    const choice = findChoice(replaceChoices, tag);
    const label = getChoiceLabel(choice, tag, humanize);
    text += label;
    lastPos = re.lastIndex;
    entityRanges.push({offset, length: label.length, key: tag });
    entityMap[tag] = {
      type: 'TAG',
      mutability: 'IMMUTABLE',
      data: { tag, label, config, field, onTagClick },
    };
  }

  return {
    blocks: [
      {
        type: 'unstyled',
        text,
        entityRanges,
      }
    ],
    entityMap,
  };
};

const findTagEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      if (entityKey === null) {
        return false;
      }
      const entity = contentState.getEntity(entityKey);
      return entity.getType() === 'TAG';
    },
    callback
  );
};

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.

   Uses Draft.js to render text content with pretty tags.
 */
export default createReactClass({
  displayName: 'PrettyTextInput',

  mixins: [HelperMixin],

  getInitialState() {
    const { value, replaceChoices, humanize, config, field } = this.props;
    const rawContent = getRawContent(
      toString(value),
      replaceChoices,
      humanize,
      config,
      field,
      this.onTagClick,
    );
    const blocks = convertFromRaw(rawContent);
    const decorator = new CompositeDecorator([
      {
        strategy: findTagEntities,
        component: TagComponent,
      }
    ]);

    const editorState = EditorState.createWithContent(
      blocks, decorator
    );

    return {
      isChoicesOpen: false,
      editorState,
    };
  },

  /* Return true if we should render the placeholder */
  hasPlaceholder() {
    return !this.props.value;
  },

  handleChoiceSelection(tag) {
    const { config, field, humanize, replaceChoices } = this.props;
    const { editorState, selectedTagEntityKey } = this.state;

    const contentState = editorState.getCurrentContent();

    const blocks = contentState.getBlockMap();
    let entityRange, blockKey;
    blocks.forEach((block) => {
      block.findEntityRanges(
        (value) => value.get('entity') === selectedTagEntityKey,
        (start, end) => {
          blockKey = block.getKey();
          // TODO; not sure why has to be anchorOffset, focusOffset instead of start, end
          entityRange = {
            anchorOffset: start,
            focusOffset: end,
          };
        },
      );
    });

    const selectionState = entityRange ?
      SelectionState
        .createEmpty(blockKey)
        .merge(entityRange) :
      editorState.getSelection();

    const choice = findChoice(replaceChoices, tag);
    const label = getChoiceLabel(choice, tag, humanize);

    const contentStateWithReplacedText = Modifier.replaceText(
      contentState, selectionState, label
    );
    const contentStateWithEntity = contentStateWithReplacedText.createEntity(
      'TAG',
      'IMMUTABLE',
      { tag, label, config, field, onTagClick: this.onTagClick },
    );

    const currentSelectionState = entityRange ?
      SelectionState.createEmpty(blockKey) :
      editorState.getSelection();
    const newSelectionState = currentSelectionState
      .merge({
        anchorOffset: selectionState.getAnchorOffset(),
        focusOffset: selectionState.getAnchorOffset() + label.length,
      });

    const newEntityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newContentState = Modifier.applyEntity(
      contentStateWithEntity,
      newSelectionState,
      newEntityKey,
    );

    const newEditorState = EditorState.push(editorState, newContentState);

    this.setState({
      editorState: newEditorState,
      isChoicesOpen: false,
    });
  },

  onBlur() {
    this.props.onBlur();
  },

  wrapperTabIndex() {
    return this.props.tabIndex || 0;
  },

  getCloseIgnoreNodes() {
    return this.toggleRef;
  },

  onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen(isOpen) {
    var action = isOpen ? 'open-replacements' : 'close-replacements';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  insertBtn() {
    const onInsertClick = () => {
      this.setState({selectedTagPos: null});
      this.onToggleChoices();
    };

    const props = {
      ref: ref(this, 'toggle'),
      onClick: onInsertClick.bind(this),
      field: this.props.field
    };
    return this.props.config.createElement('insert-button', props, 'Insert...');
  },

  choices() {
    return this.props.config.createElement('choices', {
      ref: ref(this, 'choices'),
      onFocusSelect: () => {}, // TODO
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

  onChoiceAction(choice) {
    this.setState({
      isChoicesOpen: !!choice.isOpen
    });
    this.onStartAction(choice.action, choice);
  },

  onTagClick(entityKey) {
    this.setState({ selectedTagEntityKey: entityKey });
    this.onToggleChoices();
  },

  onChangeEditor(editorState) {
    this.setState({ editorState });
  },

  handleKeyCommand(command) {
    if (command === 'show-choices') {
      this.setState({ isChoicesOpen: true });
      return 'handled';
    }
    return 'not-handled';
  },

  render() {
    return this.renderWithConfig();
  },

  renderDefault() {
    const { classes } = this.props;
    const { editorState, isChoicesOpen } = this.state;

    const textBoxClasses = cx(_.extend({}, classes, {
      'pretty-text-box': true,
      placeholder: this.hasPlaceholder(),
    }));

    return (
      <div onKeyDown={this.onKeyDown}
        className={cx({'pretty-text-wrapper': true, 'choices-open': isChoicesOpen})}>
        <div className="pretty-text-click-wrapper" onClick={this.onFocusClick}>
          <div className={textBoxClasses} tabIndex={this.wrapperTabIndex()} onBlur={this.onBlur}>
            <div className="internal-text-wrapper">
              <Editor
                editorState={editorState}
                keyBindingFn={keyBindingFn}
                handleKeyCommand={this.handleKeyCommand}
                onChange={this.onChangeEditor} />
            </div>
          </div>
        </div>
        {this.insertBtn()}
        {this.choices()}
      </div>
    );
  },
});
