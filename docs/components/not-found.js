'use strict';

var React = require('react');

var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');

module.exports = class extends React.Component {
  render() {
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
};
