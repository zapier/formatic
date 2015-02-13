'use strict';

var React = require('react');
var R = React.DOM;
var snippets = require('../snippets');

module.exports = React.createClass({

  componentDidMount: function () {
    window.prettyPrint();
  },

  componentDidUpdate: function () {
    window.prettyPrint();
  },

  render: function () {
    var snippet = this.props.snippet;

    if (!snippet && this.props.name) {
      snippet = snippets[this.props.name];
    }

    return (
      //R.div({className: 'highlight'},
        R.pre({className: 'prettyprint'},
          //R.code({className: this.props.language ? this.props.language : 'plain'},
            snippet
          //)
        )
      //)
    );
  }

});
