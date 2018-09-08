'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var R = React.DOM;

module.exports = createReactClass({

  componentDidMount: function () {
    window.prettyPrint();
  },

  componentDidUpdate: function () {
    window.prettyPrint();
  },

  render: function () {
    var snippet = this.props.code;

    if (!snippet && this.props.json) {
      snippet = JSON.stringify(this.props.json, null, 2);
    }

    var lang = '';

    if (this.props.lang) {
      lang += ' lang-' + this.props.lang;
    }

    return (
      R.pre({className: 'prettyprint' + lang},
          snippet
      )
    );
  }

});
