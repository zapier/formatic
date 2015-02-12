'use strict';

var React = require('react');
var R = React.DOM;
var E = React.createElement;
var NavMain = require('./nav-main');

module.exports = React.createClass({

  render: function () {
    return R.div({},
      E(NavMain, {activePage: 'getting-started'}),
      'Getting started!'
    );
  }

});
