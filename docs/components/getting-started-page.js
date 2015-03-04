'use strict';

var React = require('react');
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');
var Snippet = require('./snippet');
var ReactPlayground = require('./react-playground');
var fs = require('fs');
var path = require('path');

module.exports = React.createClass({

  render: function () {

    return (
      <div>
        <NavMain activePage="getting-started"/>
        <Header title="Getting started" subTitle="Installing and using Formatic"/>
        <div className="container bs-docs-container">
          <div className="row">
            <div className="col-md-9" role="main">
              <div className="bs-docs-section">
                <h2 id="setup" className="page-header">Setup</h2>

                <p className="lead">You can import Formatic as a CommonJS module or as a global.</p>
                <h3>CommonJS</h3>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/npm-install.sh'), 'utf8')}/>
                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/use-commonjs.js'), 'utf8')}/>

                <h3>Global</h3>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/bower-install.sh'), 'utf8')}></Snippet>

                <p>
                  The bower repo contains <code>formatic-dev.js</code> and <code>formatic-min.js</code>
                  with the React class exported as <code>window.Formatic</code>.
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/use-global.html'), 'utf8')}></Snippet>
              </div>

              <div className="bs-docs-section">
                <h2 id="usage" className="page-header">Basic Usage</h2>

                <p>
                  Basic usage of Formatic is pretty simple. Formatic is just a React class. Pass in the fields
                  as props to render your fields. Again, the simple example from above:
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/basic.js'), 'utf8')}/>

                <p>
                  The live example is the same. The only difference is that we render to <code>mountNode</code>{','}
                  which is just the DOM node for the example.
                </p>

                <ReactPlayground hideValueTab={true} code={fs.readFileSync(path.join(__dirname, '../examples/basic.js'), 'utf8')} />

                <p>
                  Besides passing in fields, you can also pass in the value.
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../examples/basic-controlled-value.js'), 'utf8')}/>

                <ReactPlayground hideValueTab={true} code={fs.readFileSync(path.join(__dirname, '../examples/basic-controlled-value.js'), 'utf8')} />
              </div>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

});
