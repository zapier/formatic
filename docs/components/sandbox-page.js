'use strict';

var React = require('react');
var R = React.DOM;
var E = React.createElement;
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');

module.exports = React.createClass({

  render: function () {
    return R.div({},
      E(NavMain, {activePage: 'sandbox'}),
      E(Header, {
        title: 'Sandbox',
        subTitle: 'Play with Formatic.'}),
      E(Footer)
    );
  }

});
