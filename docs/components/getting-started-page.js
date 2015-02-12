'use strict';

var React = require('react');
var R = React.DOM;
var E = React.createElement;
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');
var Snippet = require('./snippet');

module.exports = React.createClass({

  render: function () {
    return R.div({},
      E(NavMain, {activePage: 'getting-started'}),
      E(Header, {
        title: 'Getting started',
        subTitle: 'Installing and using Formatic.'}),

      R.div({className: 'container bs-docs-container'},
        R.div({className: 'row'},
          R.div({className: 'col-md-9', role: 'main'},
            R.div({className: 'bs-docs-section'},
              R.h2({id: 'setup', className: 'page-header'}, 'Setup'),

              R.p({className: 'lead'}, 'You can import Formatic as a CommonJS module or as a global.'),

              R.h3(null, 'CommonJS'),

              E(Snippet, {language: 'shell', name: 'npm-install'}),
              E(Snippet, {language: 'js', name: 'use-commonjs'}),

              R.h3(null, 'Global'),

              E(Snippet, {language: 'shell', name: 'bower-install'}),

              R.p(null,
                'The bower repo contains ',
                R.code(null, 'formatic-dev.js'),
                ' and ',
                R.code(null, 'formatic.min.js'),
                ' with the React class exported as ',
                R.code(null, 'window.Formatic'),
                '.'
              ),

              E(Snippet, {language: 'html', name: 'use-global'})
            )
          )
        )
      ),
      E(Footer)
    );
  }

});
