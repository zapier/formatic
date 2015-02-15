'use strict';

var React = require('react');
var R = React.DOM;
var E = React.createElement;
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');
var Snippet = require('./snippet');
var fs = require('fs');
var path = require('path');

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

              E(Snippet, {code: fs.readFileSync(path.join(__dirname, '../snippets/npm-install.sh'), 'utf8')}),
              E(Snippet, {code: fs.readFileSync(path.join(__dirname, '../snippets/use-commonjs.js'), 'utf8')}),

              R.h3(null, 'Global'),

              E(Snippet, {code: fs.readFileSync(path.join(__dirname, '../snippets/bower-install.sh'), 'utf8')}),

              R.p(null,
                'The bower repo contains ',
                R.code(null, 'formatic-dev.js'),
                ' and ',
                R.code(null, 'formatic.min.js'),
                ' with the React class exported as ',
                R.code(null, 'window.Formatic'),
                '.'
              ),

              E(Snippet, {code: fs.readFileSync(path.join(__dirname, '../snippets/use-global.js'), 'utf8')})
            )
          )
        )
      ),
      E(Footer)
    );
  }

});
