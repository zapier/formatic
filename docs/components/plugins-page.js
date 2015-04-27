'use strict';

var React = require('react');
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');
// var Snippet = require('./snippet');
// var ReactPlayground = require('./react-playground');
// var fs = require('fs');
// var path = require('path');

module.exports = React.createClass({

  render: function () {

    return (
      <div>
        <NavMain activePage="plugins"/>
        <Header title="Plugins" subTitle="Extending Formatic"/>
        <div className="container bs-docs-container">
          <div className="row">
            <div className="col-md-9" role="main">
              <div className="bs-docs-section">
                <h2 id="config" className="page-header">Config</h2>

                <p>
                  Plugins just build on the configuration object that is passed into Formatic, so
                  first let's talk about the config.
                </p>

                <p>
                  Almost all of Formatic's behavior is passed in via the <code>config</code> property.
                  If you pass in no config, then Formatic uses it's
                  own <a href="annotated-source/default-config.html" target="formatic-annotated-source">default config</a>.
                  To change Formatic's behavior, you simply pass in a config object with different methods.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

});
