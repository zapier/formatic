'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

var Field = require('./field');
var utils = require('../../utils');

var noBreak = function (value) {
  return value.replace(/ /g, '\u00a0');
};

var LEFT_PAD = '\u00a0\u00a0';
var RIGHT_PAD = '\u00a0\u00a0';

module.exports = React.createClass({

  mixins: [require('./mixins/undo-stack')],

  getInitialState: function () {
    var value = this.props.field.value || '';
    var parts = utils.parseTextWithTags(value);
    var tokens = this.tokens(parts);
    var indexMap = this.indexMap(tokens);

    return {
      prettyStyle: {},
      prettyUpdateStyle: {},
      tokens: tokens,
      indexMap: indexMap,
      value: value,
      plainValue: this.plainValue(value),
      pos: indexMap.length,
      range: 0,
      undoDepth: 100
    };
  },

  getStateSnapshot: function () {
    return {
      value: this.state.value,
      pos: this.state.pos
    };
  },

  setStateSnapshot: function (snapshot) {
    this.props.onChange(snapshot.value);
    this.setState({
      pos: snapshot.pos
    });
  },

  componentWillReceiveProps: function (props) {
    var value = props.field.value || '';
    var parts = utils.parseTextWithTags(value);
    var tokens = this.tokens(parts);
    var indexMap = this.indexMap(tokens);

    this.setState({
      value: value,
      plainValue: this.plainValue(value),
      tokens: tokens,
      indexMap: indexMap
    });
  },

  tokens: function (parts) {
    return [].concat.apply([], parts.map(function (part) {
      if (part.type === 'tag') {
        return part;
      } else {
        return part.value.split('');
      }
    }));
  },

  indexMap: function (tokens) {
    var indexMap = [];
    _.each(tokens, function (token, tokenIndex) {
      if (token.type === 'tag') {
        var label = LEFT_PAD + noBreak(this.prettyLabel(token.value)) + RIGHT_PAD;
        var labelChars = label.split('');
        _.each(labelChars, function () {
          indexMap.push(tokenIndex);
        });
      } else {
        indexMap.push(tokenIndex);
      }
    }.bind(this));
    return indexMap;
  },

  onScroll: function () {
    this.refs.pretty.getDOMNode().scrollTop = this.refs.text.getDOMNode().scrollTop;
    this.refs.pretty.getDOMNode().scrollLeft = this.refs.text.getDOMNode().scrollLeft;
  },

  tokenIndex: function (pos, tokens, indexMap) {
    tokens = tokens || this.state.tokens;
    indexMap = indexMap || this.state.indexMap;
    if (pos < 0) {
      pos = 0;
    } else if (pos >= indexMap.length) {
      return tokens.length;
    }
    return indexMap[pos];
  },

  onChange: function () {

    var node = this.refs.text.getDOMNode();

    var prevPos = this.state.pos;
    var prevRange = this.state.range;
    var pos = node.selectionStart;

    var tokens = this.state.tokens;
    var realPrevIndex = this.tokenIndex(prevPos);
    var realPrevEndIndex = this.tokenIndex(prevPos + prevRange);
    var realPrevRange = realPrevEndIndex - realPrevIndex;

    if (realPrevRange > 0) {
      tokens.splice(realPrevIndex, realPrevRange);
    }

    if (pos > prevPos) {
      var addedText = node.value.substring(prevPos, pos);
      tokens.splice(realPrevIndex, 0, addedText);
    } else if ((node.value.length + 1) === this.state.plainValue.length) {
      var token = this.tokenAt(pos);
      var tokenBefore = this.tokenBefore(pos);
      if (token === tokenBefore) {
        pos = this.moveOffTag(pos, tokens, this.indexMap(tokens), -1);
      }
      tokens.splice(realPrevIndex - 1, 1);
      node.setSelectionRange(pos, pos);
    }

    var rawValue = this.rawValue(tokens);

    this.props.onChange(rawValue);

    this.snapshot();

    this.setState({
      range: 0,
      pos: pos
    });
  },
  //
  componentDidUpdate: function () {
    if (document.activeElement === this.refs.text.getDOMNode()) {
    //   this.refs.text.getDOMNode().setSelectionRange(this.state.pos, this.state.pos + this.state.range);
      this.refs.text.getDOMNode().setSelectionRange(this.state.pos, this.state.pos + this.state.range);
    }
  },

  componentDidMount: function () {
    this.setState({
      prettyStyle: {
        fontSize: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('font-size'),
        fontFamily: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('font-family'),
        width: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('width'),
        height: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('height'),
        margin: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('margin'),
        padding: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('padding'),
        border: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('border'),
        overflow: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('overflow'),
        wordWrap: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('word-wrap'),
        whiteSpace: document.defaultView
          .getComputedStyle(this.refs.text.getDOMNode(), null)
          .getPropertyValue('white-space')
      }
    });
  },

  prettyLabel: function (key) {
    var form = this.props.form;
    if (form.meta('prettyTextareaLabels') && form.meta('prettyTextareaLabels')[key]) {
      return form.meta('prettyTextareaLabels')[key];
    }
    if (form.meta('prettyTextareaLabelFallback')) {
      return form.meta('prettyTextareaLabelFallback')(key);
    }
    return key;
  },

  plainValue: function (value) {
    var parts = utils.parseTextWithTags(value);
    return parts.map(function (part) {
      if (part.type === 'text') {
        return part.value;
      } else {
        return LEFT_PAD + noBreak(this.prettyLabel(part.value)) + RIGHT_PAD;
      }
    }.bind(this)).join('');
  },

  prettyValue: function (value) {
    var parts = utils.parseTextWithTags(value);
    return parts.map(function (part, i) {
      if (part.type === 'text') {
        if (i === (parts.length - 1)) {
          if (part.value[part.value.length - 1] === '\n') {
            return part.value + '\u00a0';
          }
        }
        return part.value;
      } else {
        return R.span({className: 'pretty-part'},
          R.span({className: 'pretty-part-left'}, LEFT_PAD),
          R.span({className: 'pretty-part-text'}, noBreak(this.prettyLabel(part.value))),
          R.span({className: 'pretty-part-right'}, RIGHT_PAD)
        );
      }
    }.bind(this));
  },

  rawValue: function (tokens) {
    return tokens.map(function (token) {
      if (token.type === 'tag') {
        return '{{' + token.value + '}}';
      } else {
        return token;
      }
    }).join('');
  },

  moveOffTag: function (pos, tokens, indexMap, dir) {
    if (typeof dir === 'undefined' || dir > 0) {
      dir = 1;
    } else {
      dir = -1;
    }
    var token;
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

  tokenAt: function (pos) {
    if (pos >= this.state.indexMap.length) {
      return null;
    }
    if (pos < 0) {
      pos = 0;
    }
    return this.state.tokens[this.state.indexMap[pos]];
  },

  tokenBefore: function (pos) {
    if (pos >= this.state.indexMap.length) {
      pos = this.state.indexMap.length;
    }
    if (pos <= 0) {
      return null;
    }
    return this.state.tokens[this.state.indexMap[pos - 1]];
  },

  normalizePosition: function (pos, selectDir) {
    // At start or end, so okay.
    if (pos <= 0 || pos >= this.state.indexMap.length) {
      if (pos < 0) {
        pos = 0;
      }
      if (pos > this.state.indexMap.length) {
        pos = this.state.indexMap.length;
      }
      return pos;
    }

    var token = this.tokenAt(pos);
    var tokenBefore = this.tokenBefore(pos);

    // Between two tokens, so okay.
    if (token !== tokenBefore) {
      return pos;
    }

    var prevToken = this.tokenAt(this.state.pos);
    var prevTokenBefore = this.tokenBefore(this.state.pos);

    var rightPos = this.moveOffTag(pos, this.state.tokens, this.state.indexMap);
    var leftPos = this.moveOffTag(pos, this.state.tokens, this.state.indexMap, -1);

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

    var newPos = rightPos;
    if (typeof selectDir === 'undefined' || selectDir === -1) {
      if (rightPos - pos > pos - leftPos) {
        newPos = leftPos;
      }
    }
    return newPos;
  },

  onSelect: function () {
    var start = this.refs.text.getDOMNode().selectionStart;
    var pos = this.normalizePosition(start);


    var end = this.refs.text.getDOMNode().selectionEnd;
    var range = 0;
    if (end > start) {
      var selectDir = 1;
      if (end === this.state.pos) {
        selectDir = -1;
      }
      var endPos = this.normalizePosition(end, selectDir);
      if (endPos > pos) {
        range = endPos - pos;
      }
    }

    this.setState({
      pos: pos,
      range: range
    });
  },

  onCopy: function () {
    var node = this.refs.text.getDOMNode();
    var start = node.selectionStart;
    var end = node.selectionEnd;
    var sel = window.getSelection();
    var copyFrom = document.createElement('pre');
    copyFrom.style.position = 'absolute';
    copyFrom.style.left = '-99999px';
    var text = '' + sel;
    var realStartIndex = this.tokenIndex(start);
    var realEndIndex = this.tokenIndex(end);
    var tokens = this.state.tokens.slice(realStartIndex, realEndIndex);
    text = this.rawValue(tokens);
    copyFrom.innerHTML = text;
    document.body.appendChild(copyFrom);
    sel.selectAllChildren(copyFrom);
    window.setTimeout(function() {
      document.body.removeChild(copyFrom);
      node.setSelectionRange(start, end);
    },0);
  },

  onKeyDown: function (event) {
    if (event.keyCode === 90 && (event.metaKey || event.ctrlKey) && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    } else if (
      (event.keyCode === 89 && event.ctrlKey && !event.shiftKey) ||
      (event.keyCode === 90 && event.metaKey && event.shiftKey)
    ) {
      this.redo();
    }
  },

  render: function () {
    var field = this.props.field;

    return Field({field: field},
      R.div({style: {position: 'relative'}},

        R.pre({
          className: 'pretty-overlay',
          ref: 'pretty',
          style: _.extend({
            position: 'absolute'
          }, this.state.prettyStyle)
        },
          this.prettyValue(this.state.value)
        ),

        R.textarea({
          ref: 'text',
          rows: 5,
          name: field.key,
          value: this.state.plainValue,
          onChange: this.onChange,
          onScroll: this.onScroll,
          style: {
            backgroundColor: 'rgba(0,0,0,0)',
            position: 'relative',
            top: 0,
            left: 0
          },
          onKeyPress: this.onKeyPress,
          onKeyDown: this.onKeyDown,
          onSelect: this.onSelect,
          onCopy: this.onCopy
        })
      )
    );
  }
});
