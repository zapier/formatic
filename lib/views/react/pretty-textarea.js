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
    var chars = this.state.chars.concat(char);
    // this.setState({
    //   chars: chars
    // });
    return chars;
  },

  popChar: function () {
    var chars = this.state.chars.slice(0, this.state.chars.length - 1);
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

  onKeyPress: function (event) {
    this.setState({
      cursorPosition: this.state.cursorPosition + 1
    });
    var charCode = event.charCode;
    var chars;
    if (event.keyCode === 13) {
      chars = this.pushChar('\n');
    } else {
      chars = this.pushChar(String.fromCharCode(charCode));
    }
    this.props.onChange(this.getValue(chars));
  },

  onKeyDown: function (event) {
    var keyCode = event.keyCode;
    var chars;
    if (keyCode === 8) {
      event.preventDefault();
      this.setState({
        cursorPosition: this.state.cursorPosition - 1
      });
      chars = this.popChar();
      this.props.onChange(this.getValue(chars));
      return false;
    } else if (keyCode === 32) {
      event.preventDefault();
      chars = this.pushChar(' ');
      this.props.onChange(this.getValue(chars));
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
    return chars.map(function (char) {
      if (char.type === 'tag') {
        return R.span({'data-key': char.value, className: 'pretty-part'},
          R.span({className: 'pretty-part-left'}, '{{'),
          R.span({className: 'pretty-part-text'}, noBreak(this.prettyLabel(char.value))),
          R.span({className: 'pretty-part-right'}, '}}')
        );
      } else {
        return char;
      }
    }.bind(this));
  },

  withCursor: function (chars) {
    return [
      this.prettyChars(chars),
      R.span({style: {borderLeft: 'solid red 1px'}})
    ];
  },

  render: function () {
    return Field({field: this.props.field},
      R.pre({ref: 'editor', onKeyPress: this.onKeyPress, onKeyDown: this.onKeyDown, tabIndex: 3, style: {border: 'solid 2px black', height: '100px'}},
        this.withCursor(this.state.chars)
      )
    );
  }
});
