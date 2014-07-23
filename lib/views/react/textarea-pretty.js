'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

var Field = require('./field');

var parseForStyle = function (value, fn) {
  value = value || '';
  var parts = value.split('{{');
  parts = [parts[0]].concat(
    parts.slice(1).map(function (part) {
      if (part.indexOf('}}') >= 0) {
        return [
          fn(part.substring(0, part.indexOf('}}'))),
          part.substring(part.indexOf('}}') + 2)
        ];
      } else {
        return '{{' + part;
      }
    })
  );
  return [].concat.apply([], parts);
};

var styled = function (value) {
  return parseForStyle(value, function (part) {
    return R.span({className: 'pretty-part'},
      R.span({className: 'pretty-part-left'}, '{{'),
      R.span({className: 'pretty-part-text'}, part.replace(/ /g, '\u00a0')),
      R.span({className: 'pretty-part-right'}, '}}')
    );
  });
};

var matchStyled = function (value) {
  return parseForStyle(value, function (part) {
    return '{{' + part.replace(/ /g, '\u00a0') + '}}';
  }).join('');
};

module.exports = React.createClass({

  getInitialState: function () {
    return {
      prettyStyle: {},
    };
  },

  componentDidMount: function () {

    // console.log(document.defaultView
    //       .getComputedStyle(this.refs.text.getDOMNode(), null)
    //       .getPropertyValue('width'))

    // this.refs.pretty.getDOMNode().style.cssText = document.defaultView.getComputedStyle(this.refs.text.getDOMNode(), null).cssText
    //   + ';position: absolute; top: 0, left: 0';

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
          value: matchStyled(field.value),
          onChange: this.props.onChange,
          style: {

          }
        }),

        R.div({
          className: 'pretty-overlay',
          ref: 'pretty',
          style: _.extend({
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }, this.state.prettyStyle)
        },
          styled(field.value)
        )
      )
    );
  }
});
