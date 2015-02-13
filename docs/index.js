'use strict';

var React = require('react');
var Root = require('./components/root');
var Router = require('react-router');

var E = React.createElement;

// For React devtools
window.React = React;

Router.run(Root.routes, Router.HistoryLocation, function (Handler) {
  React.render(E(Handler), document);
});
