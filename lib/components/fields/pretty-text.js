// # pretty-textarea component

/*
Textarea that will display highlights behind "tags". Tags currently mean text
that is enclosed in braces like `{{foo}}`. Tags are replaced with labels if
available or humanized.

This component is quite complicated because:
- We are displaying text in the textarea but have to keep track of the real
  text value in the background. We can't use a data attribute, because it's a
  textarea, so we can't use any elements at all!
- Because of the hidden data, we also have to do some interception of
  copy, which is a little weird. We intercept copy and copy the real text
  to the end of the textarea. Then we erase that text, which leaves the copied
  data in the buffer.
- React loses the caret position when you update the value to something
  different than before. So we have to retain tracking information for when
  that happens.
- Because we monkey with copy, we also have to do our own undo/redo. Otherwise
  the default undo will have weird states in it.

So good luck!
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import _ from '../../undash';
import utils, { ref } from '../../utils';
import FieldMixin from '../../mixins/field';
import UndoStackMixin from '../../mixins/undo-stack';
import ResizeMixin from '../../mixins/resize';

const noBreak = function (value) {
  return value.replace(/ /g, '\u00a0');
};

const LEFT_PAD = '\u00a0\u00a0';
// Why this works, I'm not sure.
const RIGHT_PAD = '  '; //'\u00a0\u00a0';

const idPrefixRegEx = /^[0-9]+__/;

// Zapier specific stuff. Make a plugin for this later.
const removeIdPrefix = function (key) {
  if (idPrefixRegEx.test(key)) {
    return key.replace(idPrefixRegEx, '');
  }
  return key;
};

const positionInNode = function (position, node) {
  const rect = node.getBoundingClientRect();
  if (position.x >= rect.left && position.x <= rect.right) {
    if (position.y >= rect.top && position.y <= rect.bottom) {
      return true;
    }
  }
  return undefined;
};

// Wrap a text value so it has a type. For parsing text with tags.
const textPart = function (value, type) {
  type = type || 'text';
  return {
    type,
    value
  };
};

// Parse text that has tags like {{tag}} into text and tags.
const parseTextWithTags = function (value) {
  value = value || '';
  let parts = value.split(/{{(?!{)/);
  let frontPart = [];
  if (parts[0] !== '') {
    frontPart = [
      textPart(parts[0])
    ];
  }
  parts = frontPart.concat(
    parts.slice(1).map(function (part) {
      if (part.indexOf('}}') >= 0) {
        return [
          textPart(part.substring(0, part.indexOf('}}')), 'tag'),
          textPart(part.substring(part.indexOf('}}') + 2))
        ];
      } else {
        return textPart('{{' + part, 'text');
      }
    })
  );
  return [].concat.apply([], parts);
};


export default createReactClass({

  displayName: 'TaggedText',

  mixins: [
    FieldMixin,
    UndoStackMixin,
    ResizeMixin
  ],

  //
  // getDefaultProps: function () {
  //   return {
  //     className: plugin.config.className
  //   };
  // },

  getReplaceState: function (props) {
    const replaceChoices = props.config.fieldReplaceChoices(props.field);
    const replaceChoicesLabels = {};
    replaceChoices.forEach(function (choice) {
      replaceChoicesLabels[choice.value] = choice.label;
    });
    return {
      replaceChoices,
      replaceChoicesLabels
    };
  },

  getInitialState: function () {
    const replaceState = this.getReplaceState(this.props);

    return {
      undoDepth: 100,
      isChoicesOpen: false,
      hoverPillRef: null,
      replaceChoices: replaceState.replaceChoices,
      replaceChoicesLabels: replaceState.replaceChoicesLabels
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState(this.getReplaceState(newProps));
  },

  componentWillMount: function () {
    // Not quite state, this is for tracking selection info.
    this.tracking = {};

    const parts = parseTextWithTags(this.props.field.value);
    const tokens = this.tokens(parts);
    const indexMap = this.indexMap(tokens);

    this.tracking.pos = indexMap.length;
    this.tracking.range = 0;
    this.tracking.tokens = tokens;
    this.tracking.indexMap = indexMap;
  },

  getStateSnapshot: function () {
    return {
      value: this.props.field.value,
      pos: this.tracking.pos,
      range: this.tracking.range
    };
  },

  setStateSnapshot: function (snapshot) {
    this.tracking.pos = snapshot.pos;
    this.tracking.range = snapshot.range;
    this.onChangeValue(snapshot.value);
  },

  // Turn into individual characters and tags
  tokens: function (parts) {
    return [].concat.apply([], parts.map(function (part) {
      if (part.type === 'tag') {
        return part;
      } else {
        return part.value.split('');
      }
    }));
  },

  // Map each textarea index back to a token
  indexMap: function (tokens) {
    const indexMap = [];
    _.each(tokens, function (token, tokenIndex) {
      if (token.type === 'tag') {
        const label = LEFT_PAD + noBreak(this.prettyLabel(token.value)) + RIGHT_PAD;
        const labelChars = label.split('');
        _.each(labelChars, function () {
          indexMap.push(tokenIndex);
        });
      } else {
        indexMap.push(tokenIndex);
      }
    }.bind(this));
    return indexMap;
  },

  // Make highlight scroll match textarea scroll
  onScroll: function () {
    this.highlightRef.scrollTop = this.contentRef.scrollTop;
    this.highlightRef.scrollLeft = this.contentRef.scrollLeft;
  },

  // Given some postion, return the token index (position could be in the middle of a token)
  tokenIndex: function (pos, tokens, indexMap) {
    if (pos < 0) {
      pos = 0;
    } else if (pos >= indexMap.length) {
      return tokens.length;
    }
    return indexMap[pos];
  },

  onChange: function (event) {
    //console.log('change:', event.target.value);

    const node = event.target;

    // Tracking is holding previous position and range
    const prevPos = this.tracking.pos;
    const prevRange = this.tracking.range;

    // New position
    let pos = node.selectionStart;

    // Going to mutate the tokens.
    const tokens = this.tracking.tokens;

    // Using the previous position and range, get the previous token position
    // and range
    const prevTokenIndex = this.tokenIndex(prevPos, tokens, this.tracking.indexMap);
    const prevTokenEndIndex = this.tokenIndex(prevPos + prevRange, tokens, this.tracking.indexMap);
    const prevTokenRange = prevTokenEndIndex - prevTokenIndex;

    // Wipe out any tokens in the selected range because the change would have
    // erased that selection.
    if (prevTokenRange > 0) {
      tokens.splice(prevTokenIndex, prevTokenRange);
      this.tracking.indexMap = this.indexMap(tokens);
    }

    // If cursor has moved forward, then text was added.
    if (pos > prevPos) {
      const addedText = node.value.substring(prevPos, pos);
      // Insert the text into the tokens.
      tokens.splice(prevTokenIndex, 0, addedText);
    // If cursor has moved backward, then we deleted (backspaced) text
    } if (pos < prevPos) {
      const token = this.tokenAt(pos);
      const tokenBefore = this.tokenBefore(pos);
      // If we moved back onto a token, then we should move back to beginning
      // of token.
      if (token === tokenBefore) {
        pos = this.moveOffTag(pos, tokens, this.indexMap(tokens), -1);
      }
      const tokenIndex = this.tokenIndex(pos, tokens, this.tracking.indexMap);
      // Now we can remove the tokens that were deleted.
      tokens.splice(tokenIndex, prevTokenIndex - tokenIndex);
    }

    // Convert tokens back into raw value with tags. Newly formed tags will
    // become part of the raw value.
    const rawValue = this.rawValue(tokens);

    this.tracking.pos = pos;
    this.tracking.range = 0;

    // Set the value to the new raw value.
    this.onChangeValue(rawValue);

    this.snapshot();
  },

  componentDidUpdate: function () {
    const value = this.props.field.value || '';
    const parts = parseTextWithTags(value);
    this.tracking.tokens = this.tokens(parts);
    this.tracking.indexMap = this.indexMap(this.tracking.tokens);

    const pos = this.normalizePosition(this.tracking.pos);
    let range = this.tracking.range;
    const endPos = this.normalizePosition(pos + range);
    range = endPos - pos;

    this.tracking.pos = pos;
    this.tracking.range = range;

    if (document.activeElement === this.contentRef) {
      // React can lose the selection, so put it back.
      this.contentRef.setSelectionRange(pos, pos + range);
    }
  },

  // Get the label for a key.
  prettyLabel: function (key) {
    if (this.state.replaceChoicesLabels[key]) {
      return this.state.replaceChoicesLabels[key];
    }
    const cleaned = removeIdPrefix(key);
    return this.props.config.humanize(cleaned);
  },

  // Given the actual value of the field (with tags), get the plain text that
  // should show in the textarea.
  plainValue: function (value) {
    const parts = parseTextWithTags(value);
    return parts.map(function (part) {
      if (part.type === 'text') {
        return part.value;
      } else {
        return LEFT_PAD + noBreak(this.prettyLabel(part.value)) + RIGHT_PAD;
      }
    }.bind(this)).join('');
  },

  // Given the actual value of the field (with tags), get the html used to
  // highlight the labels.
  prettyValue: function (value) {
    const parts = parseTextWithTags(value);
    return parts.map(function (part, i) {
      if (part.type === 'text') {
        if (i === (parts.length - 1)) {
          if (part.value[part.value.length - 1] === '\n') {
            return part.value + '\u00a0';
          }
        }
        return part.value;
      } else {
        // Make a pill
        const pillRef = 'prettyPart' + i;
        let className = 'pretty-part';

        if (this.state.hoverPillRef && pillRef === this.state.hoverPillRef) {
          className += ' pretty-part-hover';
        }

        return (
          <span
            key={i}
            className={className}
            ref={ref(this, pillRef)}
            data-pretty={true}
            data-ref={pillRef}>
            <span className="pretty-part-left">{LEFT_PAD}</span>
            <span className="pretty-part-text">{noBreak(this.prettyLabel(part.value))}</span>
            <span className="pretty-part-right">{RIGHT_PAD}</span>
          </span>
        );
      }
    }.bind(this));
  },

  // Given the tokens for a field, get the actual value of the field (with
  // tags)
  rawValue: function (tokens) {
    return tokens.map(function (token) {
      if (token.type === 'tag') {
        return '{{' + token.value + '}}';
      } else {
        return token;
      }
    }).join('');
  },

  // Given a position, if it's on a label, get the position left or right of
  // the label, based on direction and/or which side is closer
  moveOffTag: function (pos, tokens, indexMap, dir) {
    if (typeof dir === 'undefined' || dir > 0) {
      dir = 1;
    } else {
      dir = -1;
    }
    let token;
    if (dir > 0) {
      token = tokens[indexMap[pos]];
      while (pos < indexMap.length && tokens[indexMap[pos]].type === 'tag' && tokens[indexMap[pos]] === token) {
        pos++;
      }
    } else {
      token = tokens[indexMap[pos - 1]];
      while (pos > 0 && tokens[indexMap[pos - 1]].type === 'tag' && tokens[indexMap[pos - 1]] === token) {
        pos--;
      }
    }

    return pos;
  },

  // Get the token at some position.
  tokenAt: function (pos) {
    if (pos >= this.tracking.indexMap.length) {
      return null;
    }
    if (pos < 0) {
      pos = 0;
    }
    return this.tracking.tokens[this.tracking.indexMap[pos]];
  },

  // Get the token immediately before some position.
  tokenBefore: function (pos) {
    if (pos >= this.tracking.indexMap.length) {
      pos = this.tracking.indexMap.length;
    }
    if (pos <= 0) {
      return null;
    }
    return this.tracking.tokens[this.tracking.indexMap[pos - 1]];
  },

  // Given a position, get a corrected position (if necessary to be
  // corrected).
  normalizePosition: function (pos, prevPos) {
    if (_.isUndefined(prevPos)) {
      prevPos = pos;
    }
    // At start or end, so okay.
    if (pos <= 0 || pos >= this.tracking.indexMap.length) {
      if (pos < 0) {
        pos = 0;
      }
      if (pos > this.tracking.indexMap.length) {
        pos = this.tracking.indexMap.length;
      }
      return pos;
    }

    const token = this.tokenAt(pos);
    const tokenBefore = this.tokenBefore(pos);

    // Between two tokens, so okay.
    if (token !== tokenBefore) {
      return pos;
    }

    const prevToken = this.tokenAt(prevPos);
    const prevTokenBefore = this.tokenBefore(prevPos);

    const rightPos = this.moveOffTag(pos, this.tracking.tokens, this.tracking.indexMap);
    const leftPos = this.moveOffTag(pos, this.tracking.tokens, this.tracking.indexMap, -1);

    if (prevToken !== prevTokenBefore) {
      // Moved from left edge.
      if (prevToken === token) {
        return rightPos;
      }
      // Moved from right edge.
      if (prevTokenBefore === token) {
        return leftPos;
      }
    }

    let newPos = rightPos;

    if (pos === prevPos || pos < prevPos) {
      if (rightPos - pos > pos - leftPos) {
        newPos = leftPos;
      }
    }
    return newPos;
  },



  onSelect: function (event) {
    const node = event.target;

    let pos = node.selectionStart;
    let endPos = node.selectionEnd;

    if (pos === endPos && this.state.hoverPillRef) {
      const tokenAt = this.tokenAt(pos);
      const tokenBefore = this.tokenBefore(pos);

      if (tokenAt && tokenAt === tokenBefore && tokenAt.type && tokenAt.type === 'tag') {
        // Clicked a tag.
        const rightPos = this.moveOffTag(pos, this.tracking.tokens, this.tracking.indexMap);
        const leftPos = this.moveOffTag(pos, this.tracking.tokens, this.tracking.indexMap, -1);
        this.tracking.pos = leftPos;
        this.tracking.range = rightPos - leftPos;
        node.selectionStart = leftPos;
        node.selectionEnd = rightPos;

        if (!this.state.isChoicesOpen) {
          this.setChoicesOpen(true);
        }

        return;
      }
    }

    pos = this.normalizePosition(pos, this.tracking.pos);
    endPos = this.normalizePosition(endPos, this.tracking.pos + this.tracking.range);

    this.tracking.pos = pos;
    this.tracking.range = endPos - pos;

    node.selectionStart = pos;
    node.selectionEnd = endPos;
  },

  onCopy: function () {
    const node = this.contentRef;
    const start = node.selectionStart;
    const end = node.selectionEnd;
    let text = node.value.substring(start, end);
    const realStartIndex = this.tokenIndex(start, this.tracking.tokens, this.tracking.indexMap);
    const realEndIndex = this.tokenIndex(end, this.tracking.tokens, this.tracking.indexMap);
    const tokens = this.tracking.tokens.slice(realStartIndex, realEndIndex);
    text = this.rawValue(tokens);
    const originalValue = node.value;
    node.value = node.value + text;
    node.setSelectionRange(originalValue.length, originalValue.length + text.length);
    window.setTimeout(function() {
      node.value = originalValue;
      node.setSelectionRange(start, end);
    }, 0);
  },

  onCut: function () {
    const node = this.contentRef;
    const start = node.selectionStart;
    const end = node.selectionEnd;
    let text = node.value.substring(start, end);
    const realStartIndex = this.tokenIndex(start, this.tracking.tokens, this.tracking.indexMap);
    const realEndIndex = this.tokenIndex(end, this.tracking.tokens, this.tracking.indexMap);
    const tokens = this.tracking.tokens.slice(realStartIndex, realEndIndex);
    text = this.rawValue(tokens);
    const originalValue = node.value;
    const cutValue = node.value.substring(0, start) + node.value.substring(end);
    node.value = node.value + text;
    node.setSelectionRange(originalValue.length, originalValue.length + text.length);
    const cutTokens = this.tracking.tokens.slice(0, realStartIndex).concat(this.tracking.tokens.slice(realEndIndex));
    window.setTimeout(function() {
      node.value = cutValue;
      node.setSelectionRange(start, start);
      this.tracking.pos = start;
      this.tracking.range = 0;
      this.tracking.tokens = cutTokens;
      this.tracking.indexMap = this.indexMap(this.tracking.tokens);

      // Convert tokens back into raw value with tags. Newly formed tags will
      // become part of the raw value.
      const rawValue = this.rawValue(this.tracking.tokens);

      // Set the value to the new raw value.
      this.onChangeValue(rawValue);

      this.snapshot();
    }.bind(this), 0);
  },

  onKeyDown: function (event) {

    if (event.keyCode === 37) {
      this.leftArrowDown = true;
    } else if (event.keyCode === 39) {
      this.rightArrowDown = true;
    }

    // Cmd-Z or Ctrl-Z
    if (event.keyCode === 90 && (event.metaKey || event.ctrlKey) && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    // Cmd-Shift-Z or Ctrl-Y
    } else if (
      (event.keyCode === 89 && event.ctrlKey && !event.shiftKey) ||
      (event.keyCode === 90 && event.metaKey && event.shiftKey)
    ) {
      this.redo();
    }
  },

  onKeyUp: function (event) {
    if (event.keyCode === 37) {
      this.leftArrowDown = false;
    } else if (event.keyCode === 39) {
      this.rightArrowDown = false;
    }
  },

  // Keep the highlight styles in sync with the textarea styles.
  adjustStyles: function (isMount) {
    const overlay = this.highlightRef;
    const content = this.contentRef;

    const style = window.getComputedStyle(content);

    const backgroundColor = style.backgroundColor;

    utils.copyElementStyle(content, overlay);

    overlay.style.position = 'absolute';
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.color = 'rgba(0,0,0,0)';
    overlay.style.webkitTextFillColor = 'rgba(0,0,0,0)';
    overlay.style.resize = 'none';
    overlay.style.borderColor = 'rgba(0,0,0,0)';

    if (utils.browser.isMozilla) {

      const paddingTop = parseFloat(style.paddingTop);
      const paddingBottom = parseFloat(style.paddingBottom);

      const borderTop = parseFloat(style.borderTopWidth);
      const borderBottom = parseFloat(style.borderBottomWidth);

      overlay.style.paddingTop = '0px';
      overlay.style.paddingBottom = '0px';

      overlay.style.height = (content.clientHeight - paddingTop - paddingBottom + borderTop + borderBottom) + 'px';
      overlay.style.top = style.paddingTop;
      overlay.style.boxShadow = 'none';
    }

    if (isMount) {
      this.backgroundColor = backgroundColor;
    }
    overlay.style.backgroundColor = this.backgroundColor;
    content.style.backgroundColor = 'rgba(0,0,0,0)';
  },

  // If the textarea is resized, need to re-sync the styles.
  onResize: function () {
    this.adjustStyles();
  },

  // If the window is resized, may need to re-sync the styles.
  // Probably not necessary with element resize?
  onResizeWindow: function () {
    this.adjustStyles();
  },

  componentDidMount: function () {
    this.adjustStyles(true);
    this.setOnResize('content', this.onResize);
    //this.setOnClickOutside('choices', this.onClickOutsideChoices);
  },

  onInsertFromSelect: function (event) {
    if (event.target.selectedIndex > 0) {
      const tag = event.target.value;
      event.target.selectedIndex = 0;
      const pos = this.tracking.pos;
      const insertPos = this.normalizePosition(pos);
      const tokens = this.tracking.tokens;
      const tokenIndex = this.tokenIndex(insertPos, tokens, this.tracking.indexMap);
      tokens.splice(tokenIndex, 0, {
        type: 'tag',
        value: tag
      });
      this.tracking.indexMap = this.indexMap(tokens);
      const newValue = this.rawValue(tokens);
      this.tracking.pos += this.prettyLabel(tag).length;
      this.onChangeValue(newValue);
      this.contentRef.focus();
    }
  },

  onInsert: function (value) {
    const tag = value;
    const pos = this.tracking.pos;
    const endPos = this.tracking.pos + this.tracking.range;
    const insertPos = this.normalizePosition(pos);
    const endInsertPos = this.normalizePosition(endPos);
    const tokens = this.tracking.tokens;
    const tokenIndex = this.tokenIndex(insertPos, tokens, this.tracking.indexMap);
    const tokenEndIndex = this.tokenIndex(endInsertPos, tokens, this.tracking.indexMap);
    tokens.splice(tokenIndex, tokenEndIndex - tokenIndex, {
      type: 'tag',
      value: tag
    });
    this.tracking.indexMap = this.indexMap(tokens);
    const newValue = this.rawValue(tokens);
    this.tracking.pos += this.prettyLabel(tag).length;
    this.onChangeValue(newValue);
    this.setState({
      isChoicesOpen: false
    });
    this.contentRef.focus();
  },

  onToggleChoices: function () {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  onCloseChoices: function () {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  setChoicesOpen: function (isOpen) {
    if (isOpen) {
      this.onStartAction('open-replacements');
    } else {
      this.onStartAction('close-replacements');
    }
    this.setState({
      isChoicesOpen: isOpen
    });
  },

  closeChoices: function () {

  },

  getCloseIgnoreNodes: function () {
    return this.toggleRef;
  },

  onClickOutsideChoices: function () {
    // // If we didn't click on the toggle button, close the choices.
    // if (this.isNodeOutside(this.toggleRef, event.target)) {
    //   console.log('not a toggle click')
    //   this.setState({
    //     isChoicesOpen: false
    //   });
    // }
  },

  onMouseMove: function (event) {
    // Placeholder to get at pill under mouse position. Inefficient, but not
    // sure there's another way.

    const position = {x: event.clientX, y: event.clientY};
    const nodes = this.highlightRef.childNodes;
    let matchedNode = null;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (nodes[i].getAttribute('data-pretty')) {
        if (positionInNode(position, node)) {
          matchedNode = node;
          break;
        }
      }
    }

    if (matchedNode) {
      if (this.state.hoverPillRef !== matchedNode.getAttribute('data-ref')) {
        this.setState({
          hoverPillRef: matchedNode.getAttribute('data-ref')
        });
      }
    } else if (this.state.hoverPillRef) {
      this.setState({
        hoverPillRef: null
      });
    }
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    const config = this.props.config;
    const field = this.props.field;

    const replaceChoices = this.state.replaceChoices;

    const contentProps = {
      type: 'text',
      className: cx(_.extend({}, this.props.classes, {'pretty-content': true})),
      ref: ref(this, 'content'),
      rows: field.rows || this.props.rows,
      name: field.key,
      value: this.plainValue(this.props.field.value),
      onChange: this.onChange,
      onScroll: this.onScroll,
      style: {
        position: 'relative',
        top: 0,
        left: 0,
        cursor: this.state.hoverPillRef ? 'pointer' : null
      },
      onKeyPress: this.onKeyPress,
      onKeyDown: this.onKeyDown,
      onKeyUp: this.onKeyUp,
      onSelect: this.onSelect,
      onCopy: this.onCopy,
      onCut: this.onCut,
      onMouseMove: this.onMouseMove,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    };

    const ContentElem = config.fieldIsSingleLine(field) ?
      <input {...contentProps} /> :
      <textarea {...contentProps} />;

    const insertButton = config.createElement('insert-button', {
      ref: ref(this, 'toggle'),
      onClick: this.onToggleChoices
    }, 'Insert...');

    const choices = config.createElement('choices', {
      ref: ref(this, 'choices'),
      choices: replaceChoices,
      open: this.state.isChoicesOpen,
      onSelect: this.onInsert,
      onClose: this.onCloseChoices,
      ignoreCloseNodes: this.getCloseIgnoreNodes
    });

    return config.createElement('field', {
      field, plain: this.props.plain
    },
    <div style={{ position: 'relative' }}>
      <pre className="pretty-highlight" ref={ref(this, 'highlight')}>
        {this.prettyValue(this.props.field.value)}
      </pre>
      <ContentElem />
      {insertButton}
      {choices}
    </div>
    );
  }
});
