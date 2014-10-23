'use strict';

var React = require('react/addons');

module.exports = function (plugin) {

  var f = plugin.exports;

  var router = plugin.require('field-router');

  f.route = router.route;

  f.render = function (component, node) {

    React.renderComponent(component, node);
  };
};
