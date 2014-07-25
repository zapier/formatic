'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

var Field = require('./field');
var utils = require('../../utils');

var plainValue = function (value) {
  var parts = utils.parseTextWithTags(value);
  return parts.map(function (part) {
    if (part.type === 'text') {
      return part.value;
    } else {
      return '{{' + part.value.replace(/ /g, '\u00a0') + '}}';
    }
  }).join('');
};

var prettyValue = function (value) {
  var parts = utils.parseTextWithTags(value);
  return parts.map(function (part) {
    if (part.type === 'text') {
      return part.value;
    } else {
      return R.span({className: 'pretty-part'},
        R.span({className: 'pretty-part-left'}, '{{'),
        R.span({className: 'pretty-part-text'}, part.value.replace(/ /g, '\u00a0')),
        R.span({className: 'pretty-part-right'}, '}}')
      );
    }
  });
};

var rawValue = function (value) {
  var parts = utils.parseTextWithTags(value);
  return parts.map(function (part) {
    if (part.type === 'text') {
      return part.value;
    } else {
      return '{{' + part.value.replace(/ /g, '\u00a0') + '}}';
    }
  }).join('');
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
    this.props.onChange(rawValue(event.target.value));
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

  render: function () {

    var field = this.props.field;

    return Field({field: field},
      R.div({style: {position: 'relative'}},

        R.textarea({
          ref: 'text',
          rows: 5,
          name: field.key,
          value: plainValue(field.value),
          onChange: this.props.onChange,
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
          prettyValue(field.value)
        )
      )
    );
  }
});
