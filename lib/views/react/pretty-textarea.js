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

  getChars: function (value) {
    value = value || '';
    var parts = utils.parseTextWithTags(value);
    var chars = parts.map(function (part) {
      if (part.type === 'tag') {
        return part;
      } else {
        return part.value.split('');
      }
    });
    chars = [].concat.apply([], chars);
    return chars;
  },

  getValue: function (chars) {
    chars = chars || this.state.chars;
    return chars.map(function (char) {
      if (char.type) {
        return '{{' + char.value + '}}';
      }
      return char;
    }).join('');
  },

  getInitialState: function () {
    var chars = this.getChars(this.props.field.value);
    return {
      chars: chars,
      cursorPosition: chars.length
    };
  },

  pushChar: function (char) {
    var chars = this.state.chars.slice(0, this.state.cursorPosition).concat(
      char,
      this.state.chars.slice(this.state.cursorPosition)
    );
    // this.setState({
    //   chars: chars
    // });
    return chars;
  },

  popChar: function () {
    var chars = this.state.chars.slice(0, this.state.cursorPosition - 1).concat(
      this.state.chars.slice(this.state.cursorPosition)
    );
    // this.setState({
    //   chars: chars
    // });
    return chars;
  },

  componentWillReceiveProps: function (props) {
    this.setState({
      chars: this.getChars(props.field.value)
    });
  },

  moveBack: function () {
    if (this.state.cursorPosition > 0) {
      this.setState({
        cursorPosition: this.state.cursorPosition - 1
      });
    }
  },

  moveForward: function (chars) {
    if (this.state.cursorPosition < chars.length) {
      this.setState({
        cursorPosition: this.state.cursorPosition + 1
      });
    }
  },

  onKeyPress: function (event) {
    var charCode = event.charCode;
    var chars;
    // enter
    if (event.keyCode === 13) {
      chars = this.pushChar('\n');
    } else {
      chars = this.pushChar(String.fromCharCode(charCode));
    }
    this.moveForward(chars);
    this.props.onChange(this.getValue(chars));
  },

  onKeyDown: function (event) {
    var keyCode = event.keyCode;
    var chars;
    // backspace
    if (keyCode === 8) {
      event.preventDefault();
      this.moveBack();
      chars = this.popChar();
      this.props.onChange(this.getValue(chars));
      return false;
    // space
    } else if (keyCode === 32) {
      event.preventDefault();
      chars = this.pushChar(' ');
      this.moveForward(chars);
      this.props.onChange(this.getValue(chars));
    // left
    } else if (keyCode === 37) {
      this.moveBack();
    // right
    } else if (keyCode === 39) {
      this.moveForward(this.state.chars);
    }
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

  prettyChars: function (chars) {
    if (this.state.cursorPosition >= chars.length) {
      chars = chars.concat(null);
    }
    return chars.map(function (char, i) {
      if (char === null) {
        return R.span({style: {borderLeft: 'solid red 1px'}});
      } else if (char.type === 'tag') {
        var pill = R.span({'data-key': char.value, className: 'pretty-part'},
          R.span({className: 'pretty-part-left'}, '{{'),
          R.span({className: 'pretty-part-text'}, noBreak(this.prettyLabel(char.value))),
          R.span({className: 'pretty-part-right'}, '}}')
        );
        if (i === this.state.cursorPosition) {
          return R.span({style: {borderLeft: 'solid red 1px'}}, pill);
        }
        return pill;
      } else {
        if (i === this.state.cursorPosition) {
          return R.span({style: {borderLeft: 'solid red 1px'}}, char);
        }
        return char;
      }
    }.bind(this));
  },

  render: function () {
    return Field({field: this.props.field},
      R.pre({ref: 'editor', onKeyPress: this.onKeyPress, onKeyDown: this.onKeyDown, tabIndex: 0, style: {border: 'solid 2px black', height: '100px'}},
        this.prettyChars(this.state.chars)
      )
    );
  }
});
