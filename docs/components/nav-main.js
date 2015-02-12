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
  'components': {
    link: '/formatic/sandbox.html',
    title: 'Sandbox'
  },
  'annotated-source': {
    link: '/formatic/annotated-source/index.html',
    title: 'Annotated Source'
  }
};

module.exports = React.createClass({

  propTypes: {
    activePage: React.PropTypes.string
  },

  render: function () {
    var brand = E(Router.Link, {to: '/formatic/index.html', className: 'navbar-brand'}, 'Formatic');

    return (
      E(Bootstrap.Navbar, {componentClass: 'header', brand: brand, staticTop: true, className: 'bs-docs-nav', role: 'banner', toggleNavKey: 0},
        E(Bootstrap.Nav, {className: 'bs-navbar-collapse', role: 'navigation', eventKey: 0, id: 'top'},
          Object.keys(NAV_LINKS).map(this.renderNavItem)
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
