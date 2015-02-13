'use strict';

var React = require('react');
var R = React.DOM;
var E = React.createElement;
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');
var ReactPlayground = require('./react-playground');
var fs = require('fs');
var path = require('path');

module.exports = React.createClass({

  render: function () {

    return (
      <div>
        <NavMain activePage='field-types' ref='topNav'/>
        <Header title='Field Types'/>

        <div className="container bs-docs-container">
          <div className="row">
            <div className="col-md-9" role="main">

              <div className="bs-docs-section">

                <h1 id="single-line-string" className="page-header">Single Line String <small>single-line-string, unicode, str</small></h1>

                <h2 id="buttons-options">Example</h2>
                <p>This type is for a field that edits a single line of text.</p>
                <ReactPlayground codeText={fs.readFileSync(path.join(__dirname, '../examples/single-line-string.js'), 'utf8')} />

              </div>

              <div className="bs-docs-section">

                <h1 id="string" className="page-header">String <small>string, text, textarea</small></h1>

                <h2 id="buttons-options">Example</h2>
                <p>This type is for a field that edits multi-line text.</p>
                <ReactPlayground codeText={fs.readFileSync(path.join(__dirname, '../examples/string.js'), 'utf8')} />

              </div>

            </div>
          </div>
        </div>

        <Footer/>
      </div>
    );
  }

});
