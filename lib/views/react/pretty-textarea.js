'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

var Field = require('./field');
var utils = require('../../utils');

var noBreak = function (value) {
  return value.replace(/ /g, '\u00a0');
};

module.exports = React.createClass({

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
      pos: indexMap.length
    };
  },

  componentWillReceiveProps: function (props) {
    var value = props.field.value || '';
    var parts = utils.parseTextWithTags(value);
    var tokens = this.tokens(parts);
    var indexMap = this.indexMap(tokens);

    this.setState({
      value: value,
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
        var label = '{{' + noBreak(this.prettyLabel(token.value)) + '}}';
        var labelChars = label.split('');
        _.each(labelChars, function () {
          indexMap.push(tokenIndex);
        });
      } else {
        indexMap.push(tokenIndex);
      }
    }.bind(this));
    //console.log(indexMap.map(function (index) {return tokens[index]}));
    return indexMap;
  },

  onScroll: function () {
    this.refs.pretty.getDOMNode().scrollTop = this.refs.text.getDOMNode().scrollTop;
    this.refs.pretty.getDOMNode().scrollLeft = this.refs.text.getDOMNode().scrollLeft;
  },

  onChange: function (event) {
    //this.refs.text.getDOMNode().setSelectionRange(0, 0);
    //console.log(event.target.value);
    //this.props.onChange(this.rawValue(event.target.value));
  },

  componentDidUpdate: function () {
    // console.log(this.refs.text.getDOMNode().selectionStart)
    // console.log(this.state.pos)
    // this.refs.text.getDOMNode().selectionStart = this.state.pos;
    // this.refs.text.getDOMNode().selectionEnd = this.state.pos;
    //this.refs.text.getDOMNode().setSelectionRange(0, 5);
    this.refs.text.getDOMNode().setSelectionRange(this.state.pos, this.state.pos);
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
        return '{{' + noBreak(this.prettyLabel(part.value)) + '}}';
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
          R.span({className: 'pretty-part-left'}, '{{'),
          R.span({className: 'pretty-part-text'}, noBreak(this.prettyLabel(part.value))),
          R.span({className: 'pretty-part-right'}, '}}')
        );
      }
    }.bind(this));
  },

  // rawValue: function (value) {
  //   var parts = utils.parseTextWithTags(value);
  //   return parts.map(function (part) {
  //     if (part.type === 'text') {
  //       return part.value;
  //     } else {
  //       var partValue = part.value;
  //       if (partValue.indexOf(HIDDEN_START) === 0) {
  //         partValue = partValue.substring(HIDDEN_START.length);
  //         var hidden = partValue.substring(0, partValue.indexOf(HIDDEN_END));
  //         partValue = utils.unhideUnicodeMessage(hidden);
  //       }
  //       return '{{' + partValue + '}}';
  //     }
  //   }).join('');
  // },

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
    if (dir > 0) {
      while (pos < indexMap.length && tokens[indexMap[pos]].type === 'tag') {
        pos++;
      }
    } else {
      while (pos > 0 && tokens[indexMap[pos - 1]].type === 'tag') {
        pos--;
      }
    }

    return pos;
  },

  onKeyPress: function (event) {
    event.preventDefault();
    var node = this.refs.text.getDOMNode();
    var start = node.selectionStart;
    var charCode = event.charCode;
    var char;
    if (event.keyCode === 13) {
      char = '\n';
    } else {
      char = String.fromCharCode(charCode);
    }
    var parts;
    var newTokens;
    var indexMap;
    var pos;
    var rawValue;
    if (start >= this.state.indexMap.length) {
      pos = this.state.pos + 1;
      rawValue = this.state.value + char;
      if (char === '}') {
        parts = utils.parseTextWithTags(rawValue);
        newTokens = this.tokens(parts);
        indexMap = this.indexMap(newTokens);
        if (pos < indexMap.length || pos > indexMap.length) {
          pos = indexMap.length;
        }
      }
      this.props.onChange(rawValue);
      this.setState({
        pos: pos
      });
    } else {
      var tokens = this.state.tokens;
      var realIndex = this.state.indexMap[start];
      tokens.splice(realIndex, 0, char);
      pos = this.state.pos + 1;
      rawValue = this.rawValue(tokens);
      if (char === '{' || char === '}') {
        parts = utils.parseTextWithTags(rawValue);
        newTokens = this.tokens(parts);

        if (newTokens.length < tokens.length) {
          // Added new replacement.
          if (char === '}') {
            // Need to go backward.
            pos--;
            while (pos > 0 && tokens[this.state.indexMap[pos]] !== '{') {
              pos--;
            }
          }
          // Need to go forward.
          indexMap = this.indexMap(newTokens);
          pos = this.moveOffTag(pos, newTokens, indexMap);
        }
      }

      this.props.onChange(rawValue);
      this.setState({
        pos: pos
      });
    }
  },

  onKeyDown: function (event) {
    var node = this.refs.text.getDOMNode();
    var pos = node.selectionStart;
    //console.log(this.state.pos, pos);
    var keyCode = event.keyCode;
    // backspace
    if (keyCode === 8) {
      event.preventDefault();
      if (pos > 0 && pos <= this.state.indexMap.length) {
        pos--;
        pos = this.moveOffTag(pos, this.state.tokens, this.state.indexMap, -1);
      }
      var tokens = this.state.tokens;
      var realIndex = this.state.indexMap[pos];
      tokens.splice(realIndex, 1);
      var rawValue = this.rawValue(tokens);
      this.props.onChange(rawValue);
      this.setState({
        pos: pos
      });
    // left
    }

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


  onSelect: function (event) {
    var pos = this.refs.text.getDOMNode().selectionStart;

    // At start or end, so okay.
    if (pos <= 0 || pos >= this.state.indexMap.length) {
      this.setState({
        pos: pos
      });
      return;
    }

    var token = this.tokenAt(pos);
    var tokenBefore = this.tokenBefore(pos);

    // Between two tokens, so okay.
    if (token !== tokenBefore) {
      this.setState({
        pos: pos
      });
      return;
    }

    var prevToken = this.tokenAt(this.state.pos);
    var prevTokenBefore = this.tokenBefore(this.state.pos);

    var rightPos = this.moveOffTag(pos, this.state.tokens, this.state.indexMap);
    var leftPos = this.moveOffTag(pos, this.state.tokens, this.state.indexMap, -1);

    if (prevToken !== prevTokenBefore) {
      // Moved from left edge.
      if (prevToken === token) {
        this.setState({
          pos: rightPos
        });
        return;
      }
      // Moved from right edge.
      if (prevTokenBefore === token) {
        this.setState({
          pos: leftPos
        });
        return;
      }
    }

    var newPos = rightPos;
    if (rightPos - pos > pos - leftPos) {
      newPos = leftPos;
    }
    this.setState({
      pos: newPos
    });
  },

  render: function () {
    var field = this.props.field;

    return Field({field: field},
      R.div({style: {position: 'relative'}},

        R.pre({
          className: 'pretty-overlay',
          ref: 'pretty',
          style: _.extend({
            //position: 'relative',
            //top: 0,
            //left: 0
position: 'absolute'
//top: 0,
//left: 0
            //pointerEvents: 'none'
          }, this.state.prettyStyle)
        },
          this.prettyValue(this.state.value)
        ),

        R.textarea({
          ref: 'text',
          rows: 5,
          name: field.key,
          value: this.plainValue(this.state.value),
          onChange: this.onChange,
          onScroll: this.onScroll,
          style: {
            backgroundColor: 'rgba(0,0,0,0)',
            //position: 'absolute',
            //top: -2,
            //left: 0
position: 'relative',
top: 0,
left: 0
          },
          onKeyPress: this.onKeyPress,
          onKeyDown: this.onKeyDown,
          onSelect: this.onSelect
        })



        // R.textarea({
        //   ref: 'text',
        //   rows: 5,
        //   name: field.key,
        //   value: this.plainValue(this.state.value),
        //   onChange: this.onChange,
        //   onScroll: this.onScroll,
        //   style: {
        //
        //   },
        //   onKeyPress: this.onKeyPress,
        //   onKeyDown: this.onKeyDown,
        //   onSelect: this.onSelect
        // }),
        //
        // R.pre({
        //   className: 'pretty-overlay',
        //   ref: 'pretty',
        //   style: _.extend({
        //     position: 'absolute',
        //     top: 0,
        //     left: 0,
        //     pointerEvents: 'none'
        //   }, this.state.prettyStyle)
        // },
        //   this.prettyValue(this.state.value)
        // )
      )
    );
  }
});
