'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

var Field = require('./field');
var utils = require('../../utils');

// For future reference:
// U+200B zero width space
// U+200C zero width non-joiner Unicode code point
// U+200D zero width joiner Unicode code point
// U+FEFF zero width no-break space Unicode code point

var HIDDEN_START = '\u200d\ufeff';
var HIDDEN_END = '\ufeff\u200d';

var noBreak = function (value) {
  return value.replace(/ /g, '\u00a0');
};

module.exports = React.createClass({

  getInitialState: function () {
    return {
      prettyStyle: {},
      prettyUpdateStyle: {}
    };
  },

  onScroll: function () {
    this.refs.pretty.getDOMNode().scrollTop = this.refs.text.getDOMNode().scrollTop;
    this.refs.pretty.getDOMNode().scrollLeft = this.refs.text.getDOMNode().scrollLeft;
  },

  onChange: function (event) {
    this.props.onChange(this.rawValue(event.target.value));
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
        return '{{' + HIDDEN_START + utils.hideUnicodeMessage(part.value) + HIDDEN_END + noBreak(this.prettyLabel(part.value)) + '}}';
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

  rawValue: function (value) {
    var parts = utils.parseTextWithTags(value);
    return parts.map(function (part) {
      if (part.type === 'text') {
        return part.value;
      } else {
        var partValue = part.value;
        if (partValue.indexOf(HIDDEN_START) === 0) {
          partValue = partValue.substring(HIDDEN_START.length);
          var hidden = partValue.substring(0, partValue.indexOf(HIDDEN_END));
          partValue = utils.unhideUnicodeMessage(hidden);
        }
        return '{{' + partValue + '}}';
      }
    }).join('');
  },

  render: function () {

    var field = this.props.field;

    return Field({field: field},
      R.div({style: {position: 'relative'}},

        R.textarea({
          ref: 'text',
          rows: 5,
          name: field.key,
          value: this.plainValue(field.value),
          onChange: this.onChange,
          onScroll: this.onScroll,
          style: {

          }
        }),

        R.pre({
          className: 'pretty-overlay',
          ref: 'pretty',
          style: _.extend({
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }, this.state.prettyStyle)
        },
          this.prettyValue(field.value)
        )
      )
    );
  }
});
