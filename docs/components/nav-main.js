'use strict';

var React = require('react');
var Router = require('react-router');
var Bootstrap = require('react-bootstrap');

var R = React.DOM;
var E = React.createElement;

var NAV_LINKS = {
  'getting-started': {
    link: '/formatic/getting-started.html',
    title: 'Getting started'
  },
  'field-types': {
    link: '/formatic/field-types.html',
    title: 'Field types'
  },
  'plugins': {
    link: '/formatic/plugins.html',
    title: 'Plugins'
  }
};

module.exports = React.createClass({

  propTypes: {
    activePage: React.PropTypes.string
  },

  render: function () {
    var brand = E(Router.Link, {to: '/formatic/', className: 'navbar-brand'}, 'Formatic');

    return (
      E(Bootstrap.Navbar, {componentClass: 'header', brand: brand, staticTop: true, className: 'bs-docs-nav', role: 'banner', toggleNavKey: 0},
        E(Bootstrap.Nav, {className: 'bs-navbar-collapse', role: 'navigation', eventKey: 0, id: 'top'},
          Object.keys(NAV_LINKS).map(this.renderNavItem).concat(
            R.li({key: 'annotated-source'},
              R.a({href: '/formatic/annotated-source/index.html', target: 'formatic-annotated-source'}, 'Annotated Source')
            )
          )
        )
      )
    );
  },

  renderNavItem: function (linkName) {
    var link = NAV_LINKS[linkName];

    return (
      R.li({className: this.props.activePage === linkName ? 'active' : null, key: linkName},
        E(Router.Link, {to: link.link}, link.title)
      )
    );
  }

});
