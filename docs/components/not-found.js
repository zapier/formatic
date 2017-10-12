'use strict';

var React = require('react');
var createReactClass = require('create-react-class');

var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');

module.exports = createReactClass({
  render: function () {
    return (
        <div>
          <NavMain activePage="" />

          <Header
            title="404"
            subTitle="Hmmm this is awkward." />

          <Footer />
        </div>
      );
  }
});
