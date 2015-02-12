'use strict';

var React = require('react');
var R = React.DOM;
var E = React.createElement;
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;

var pages = {
  'home': {
    default: true,
    path: '/formatic/',
    filename: 'index.html',
    class: require('./home-page')
  },
  'getting-started': {
    path: '/formatic/getting-started.html',
    filename: 'getting-started.html',
    class: require('./getting-started-page')
  },
  'sandbox': {
    path: '/formatic/sandbox.html',
    filename: 'sandbox.html',
    class: require('./sandbox-page')
  }
};

var routes;

var Root = module.exports = React.createClass({

  statics: {
    renderToString: function (name) {
      var page = pages[name];
      var html;
      Router.run(routes, page.path, function (Handler) {
        html = React.renderToString(E(Handler));
      });
      return html;
    },
    pages: pages
  },

  mixins: [Router.State],

  render: function () {

    var initScript = [
      'window.INITIAL_PATH = ' + JSON.stringify(this.getPath()) + ';'
    ].join('\n');

    return R.html({},
      R.head({},
        R.link({href: 'vendor/bootstrap/bootstrap.css', rel: 'stylesheet'}),
        R.link({href: 'vendor/bootstrap/docs.css', rel: 'stylesheet'}),
        R.link({href: 'vendor/codemirror/codemirror.css', rel: 'stylesheet'}),
        R.link({href: 'vendor/codemirror/solarized.css', rel: 'stylesheet'}),
        R.link({href: 'vendor/codemirror/syntax.css', rel: 'stylesheet'}),
        R.link({href: 'css/style.css', rel: 'stylesheet'})
      ),
      R.body({},
        E(RouteHandler),
        R.script({dangerouslySetInnerHTML: {__html: initScript}}),
        R.script({src: 'lib/bundle.js'})
      )
    );
  }

});

var children = [];
Object.keys(pages).forEach(function (name) {
  var page = pages[name];
  if (page.default) {
    children.push(E(DefaultRoute, {handler: page.class}));
  } else {
    children.push(E(Route, {name: name, path: page.path, handler: page.class}));
  }
  //children.push(E(Route, {path: '/formatic/', handler: page.class}));
  children.push(E(Route, {path: '/formatic/index.html', handler: page.class}));
});

routes = E.apply(null, [Route, {path: '/formatic/', handler: Root}].concat(children));

Root.routes = routes;
