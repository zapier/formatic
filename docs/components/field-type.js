'use strict';

var React = require('react');

var Snippet = require('./snippet');
var ReactPlayground = require('./react-playground');

module.exports = React.createClass({

  render: function () {

    return (
      <div className="bs-docs-section">

        <h1 id={this.props.type} className="page-header">{this.props.title}{' '}
          <small>{this.props.type}
            {
              this.props.aliases ? (
                <span className="alias">{
                    this.props.aliases.join(', ')
                  }</span>
              ) : null
            }
          </small>
        </h1>

        <p>{this.props.children}</p>

        <h2>Field</h2>

        <Snippet language="js" name={this.props.type + '-field'}/>

        <h2 id={this.props.type + '-example'}>Live example</h2>

        <ReactPlayground codeText={this.props.codeText} />

      </div>
    );

  }
});
