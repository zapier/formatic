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
    return {
      cursorPosition: this.props.field.value ? this.props.field.value.length : 0
    };
  },

  onKeyPress: function (event) {
    this.setState({
      cursorPosition: this.state.cursorPosition + 1
    });
    var text = this.props.field.value || '';
    var charCode = event.charCode;
    if (event.keyCode === 13) {
      text += '\n';
    } else {
      text += String.fromCharCode(charCode);
    }
    this.props.onChange(text);
  },

  onKeyDown: function (event) {
    var keyCode = event.keyCode;
    var text = this.props.field.value || '';
    if (keyCode === 8) {
      event.preventDefault();
      this.setState({
        cursorPosition: this.state.cursorPosition - 1
      });
      text = text.substring(0, text.length - 1);
      this.props.onChange(text);
      return false;
    } else if (keyCode === 32) {
      event.preventDefault();
      text = text + ' ';
      this.props.onChange(text);
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

  prettyValue: function (value) {
    var parts = utils.parseTextWithTags(value);
    return parts.map(function (part) {
      if (part.type === 'text') {
        return part.value;
      } else {
        return R.span({'data-key': part.value, className: 'pretty-part'},
          R.span({className: 'pretty-part-left'}, '{{'),
          R.span({className: 'pretty-part-text'}, noBreak(this.prettyLabel(part.value))),
          R.span({className: 'pretty-part-right'}, '}}')
        );
      }
    }.bind(this));
  },

  withCursor: function (value) {
    value = value || '';

    if (value && value.length) {
      return [
        this.prettyValue(value),
        R.span({style: {borderLeft: 'solid red 1px'}})
      ];
    }
  },

  render: function () {
    return Field({field: this.props.field},
      R.pre({ref: 'editor', onKeyPress: this.onKeyPress, onKeyDown: this.onKeyDown, tabIndex: 3, style: {border: 'solid 2px black', height: '100px'}},
        this.withCursor(this.props.field.value)
      )
    );
  }
});
