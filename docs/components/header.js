'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
//var R = React.DOM;

module.exports = createReactClass({
  render: function () {
    return (
      <div className="bs-docs-header" id="content">
        <div className="container">
          <h1>{this.props.title}</h1>
          <p>{this.props.subTitle}</p>
        </div>
      </div>
    );
  }
});
