'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

var noBreak = function (value) {
  return value.replace(/ /g, '\u00a0');
};

var LEFT_PAD = '\u00a0\u00a0';
var RIGHT_PAD = '\u00a0\u00a0';

module.exports = function (plugin) {

  var util = plugin.require('util');

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/undo-stack'), require('./mixins/resize')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    getInitialState: function () {
      var value = this.props.field.value || '';
      var parts = util.parseTextWithTags(value);
      var tokens = this.tokens(parts);
      var indexMap = this.indexMap(tokens);

      return {
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
      this.props.field.val(snapshot.value);
      this.setState({
        pos: snapshot.pos
      });
    },

    componentWillReceiveProps: function (props) {
      var value = props.field.value || '';
      var parts = util.parseTextWithTags(value);
      var tokens = this.tokens(parts);
      var indexMap = this.indexMap(tokens);

      // var pos = this.normalizePosition(this.state.pos);
      // var range = this.state.range;
      // var endPos = this.normalizePosition(pos + range);
      // range = endPos - pos;
      //
      // console.log(pos)

      this.setState({
        value: value,
        plainValue: this.plainValue(value),
        tokens: tokens,
        indexMap: indexMap //,
        // pos: pos,
        // range: range
      });
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

    // Make highlight scroll match textarea scroll
    onScroll: function () {
      this.refs.highlight.getDOMNode().scrollTop = this.refs.content.getDOMNode().scrollTop;
      this.refs.highlight.getDOMNode().scrollLeft = this.refs.content.getDOMNode().scrollLeft;
    },

    // Given some postion, return the token index (position could be in the middle of a token)
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

    onChange: function (event) {

      //console.log('change');
      //console.log(event);

      var node = this.refs.content.getDOMNode();

      var prevPos = this.state.pos;
      var prevRange = this.state.range;
      var pos = node.selectionStart;

      var tokens = this.state.tokens;
      var realPrevIndex = this.tokenIndex(prevPos);
      var realPrevEndIndex = this.tokenIndex(prevPos + prevRange);
      var realPrevRange = realPrevEndIndex - realPrevIndex;

      //console.log(prevPos + ',' + prevRange + ',' + pos);
      //console.log(realPrevIndex + ',' + realPrevEndIndex + ',' + realPrevRange);
      //console.log(node.value);

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

      this.props.field.val(rawValue);

      this.snapshot();

      console.log(pos)

      this.setState({
        range: 0,
        pos: pos
      });
    },
    //
    componentDidUpdate: function () {
      if (document.activeElement === this.refs.content.getDOMNode()) {
        // React can lose the selection, so put it back.
        this.refs.content.getDOMNode().setSelectionRange(this.state.pos, this.state.pos + this.state.range);
      }
    },

    // Get the label for a key.
    prettyLabel: function (key) {
      if (this.props.field.def.replaceTags[key]) {
        return this.props.field.def.replaceTags[key];
      }
      return util.humanize(key);
    },

    // Given the actual value of the field (with tags), get the plain text that
    // should show in the textarea.
    plainValue: function (value) {
      var parts = util.parseTextWithTags(value);
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
      var parts = util.parseTextWithTags(value);
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
          return R.span({className: 'pretty-part'},
            R.span({className: 'pretty-part-left'}, LEFT_PAD),
            R.span({className: 'pretty-part-text'}, noBreak(this.prettyLabel(part.value))),
            R.span({className: 'pretty-part-right'}, RIGHT_PAD)
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

    // Get the token at some position.
    tokenAt: function (pos) {
      if (pos >= this.state.indexMap.length) {
        return null;
      }
      if (pos < 0) {
        pos = 0;
      }
      return this.state.tokens[this.state.indexMap[pos]];
    },

    // Get the token immediately before some position.
    tokenBefore: function (pos) {
      if (pos >= this.state.indexMap.length) {
        pos = this.state.indexMap.length;
      }
      if (pos <= 0) {
        return null;
      }
      return this.state.tokens[this.state.indexMap[pos - 1]];
    },

    // Given a position, get a corrected position (if necessary to be
    // corrected).
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
      //console.log('select');
      var node = this.refs.content.getDOMNode();

      var start = node.selectionStart;
      var pos = this.normalizePosition(start);


      var end = node.selectionEnd;
      var range = 0;
      //console.log(start + ',' + pos + ',' + end + ',' + range);
      //console.log(node.value);

      if (node.value !== this.state.value) {
        //console.log(node.value + ' != ' + this.state.value);
        return;
      }

      if (end > start) {
        var selectDir = 1;
        if (end === this.state.pos) {
          selectDir = -1;
        }
        //console.log(this.state.pos + ', selDir: ' + selectDir);
        var endPos = this.normalizePosition(end, selectDir);
        //console.log('endPos:' + endPos);
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
      var node = this.refs.content.getDOMNode();
      var start = node.selectionStart;
      var end = node.selectionEnd;
      var text = node.value.substring(start, end);
      var realStartIndex = this.tokenIndex(start);
      var realEndIndex = this.tokenIndex(end);
      var tokens = this.state.tokens.slice(realStartIndex, realEndIndex);
      text = this.rawValue(tokens);
      var originalValue = node.value;
      node.value = node.value + text;
      node.setSelectionRange(originalValue.length, originalValue.length + text.length);
      window.setTimeout(function() {
        node.value = originalValue;
        node.setSelectionRange(start, end);
      },0);
    },

    onKeyDown: function (event) {
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

    // Keep the highlight styles in sync with the textarea styles.
    adjustStyles: function () {
      var overlay = this.refs.highlight.getDOMNode();
      var content = this.refs.content.getDOMNode();
      overlay.style.cssText = document.defaultView.getComputedStyle(content, '').cssText;
      overlay.style.position = 'absolute';
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
      this.adjustStyles();
      this.setOnResize('content', this.onResize);
    },

    render: function () {
      var field = this.props.field;
      return R.div({style: {position: 'relative'}},

        R.div({
          className: 'pretty-highlight',
          ref: 'highlight',
          style: {
            position: 'absolute'
          }
        },
          this.prettyValue(this.state.value)
        ),

        R.textarea(_.extend({
          className: util.className(this.props.className, 'pretty-content'),
          ref: 'content',
          rows: 5,
          name: field.key,
          value: this.state.plainValue,
          onChange: this.onChange,
          onFocus: this.onFocus,
          onBlur: this.onBlur,
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
        }, plugin.config.attributes))
      );
    }
  });
};
