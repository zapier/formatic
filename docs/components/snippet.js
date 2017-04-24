'use strict';

var React = require('react');
var R = React.DOM;

module.exports = class extends React.Component {
  componentDidMount() {
    window.prettyPrint();
  }

  componentDidUpdate() {
    window.prettyPrint();
  }

  render() {
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
};
