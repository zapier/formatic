'use strict';

var React = require('react');
var R = React.DOM;
var E = React.createElement;
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;
//var NotFoundRoute = Router.NotFoundRoute;

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
  'field-types': {
    path: '/formatic/field-types.html',
    filename: 'field-types.html',
    class: require('./field-types-page')
  },
  'plugins': {
    path: '/formatic/plugins.html',
    filename: 'plugins.html',
    class: require('./plugins-page')
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
        R.link({rel: 'stylesheet', href: 'vendor/prettify/prettify.css'}),
        R.link({href: 'css/style.css', rel: 'stylesheet'}),
        R.link({href: 'css/formatic.css', rel: 'stylesheet'}),
        //R.link({rel: 'icon', href: 'https://zapier.cachefly.net/static/C5cFWy/images/favicon.ico', type: 'image/x-icon'})
        //R.link({rel: 'favicons', href: '../docs/assets/images/logo.png'})
        //,
        // R.link({link: 'shortcut icon', href: 'https://zapier.cachefly.net/static/C5cFWy/images/favicon.ico', type: 'image/x-icon'})
        R.link({rel: 'apple-touch-icon', sizes: '57x57', href: './favicons/apple-touch-icon-57x57.png'}),
        R.link({rel: 'apple-touch-icon', sizes: '60x60', href: './favicons/apple-touch-icon-60x60.png'}),
        R.link({rel: 'apple-touch-icon', sizes: '72x72', href: './favicons/apple-touch-icon-72x72.png'}),
        R.link({rel: 'apple-touch-icon', sizes: '76x76', href: './favicons/apple-touch-icon-76x76.png'}),
        R.link({rel: 'apple-touch-icon', sizes: '114x114', href: './favicons/apple-touch-icon-114x114.png'}),
        R.link({rel: 'apple-touch-icon', sizes: '120x120', href: './favicons/apple-touch-icon-120x120.png'}),
        R.link({rel: 'apple-touch-icon', sizes: '144x144', href: './favicons/apple-touch-icon-144x144.png'}),
        R.link({rel: 'apple-touch-icon', sizes: '152x152', href: './favicons/apple-touch-icon-152x152.png'}),
        R.link({rel: 'apple-touch-icon', sizes: '180x180', href: './favicons/apple-touch-icon-180x180.png'}),
        R.link({rel: 'icon', type: 'image/png', href: './favicons/favicon-32x32.png', sizes: '32x32'}),
        R.link({rel: 'icon', type: 'image/png', href: './favicons/android-chrome-192x192.png', sizes: '192x192'}),
        R.link({rel: 'icon', type: 'image/png', href: './favicons/favicon-96x96.png', sizes: '96x96'}),
        R.link({rel: 'icon', type: 'image/png', href: './favicons/favicon-16x16.png', sizes: '16x16'}),
        R.link({rel: 'manifest', href: './favicons/manifest.json'}),
        R.meta({name: 'msapplication-TileColor', content: '#da532c'}),
        R.meta({name: 'msapplication-TileImage', content: './favicons/mstile-144x144.png'}),
        R.meta({name: 'theme-color', content: '#ffffff'})
      ),
      <body>
        <RouteHandler/>
        <script dangerouslySetInnerHTML={{__html: initScript}}/>
        <script src="vendor/prettify/prettify.js"/>
        <script src="vendor/codemirror/codemirror.js" />
        <script src="vendor/codemirror/javascript.js" />
        <script src="vendor/JSXTransformer.js" />
        <script src="lib/bundle.js"/>
      </body>
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
});

routes = E.apply(null, [Route, {path: '/formatic/', handler: Root}].concat(children));

Root.routes = routes;
