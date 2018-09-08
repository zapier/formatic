'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var R = React.DOM;
var E = React.createElement;
var NavMain = require('./nav-main');
var Footer = require('./footer');

module.exports = createReactClass({

  render: function () {
    return (
      R.div({},
        E(NavMain, {activePage: 'home'}),
        R.main({className: 'bs-docs-masthead', id: 'content', role: 'main'},
          R.div({className: 'container'},
            R.span({className: 'bs-docs-booticon bs-docs-booticon-lg bs-docs-booticon-outline'}),
            R.p({className: 'lead'}, 'Automatic forms for React.')
          )
        ),
        E(Footer)
      )
    );
  }

});
