'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var routes = {};

  var router = plugin.exports;

  var routePlugins = plugin.requireAll(plugin.config.routes);

  router.route = function (typeName, componentName, testFn) {
    if (!routes[typeName]) {
      routes[typeName] = [];
    }
    routes[typeName].push({
      component: componentName,
      test: testFn
    });
  };

  routePlugins.forEach(function (routePlugin) {
    if (routePlugin.route) {
      router.route.apply(router, routePlugin.route);
    } else if (routePlugin.routes) {
      routePlugin.routes.forEach(function (route) {
        router.route.apply(router, route);
      });
    }
  });

  router.componentForField = function (field) {

    var typeName = field.def.type;

    if (routes[typeName]) {
      var routesForType = routes[typeName];
      var route = _.find(routesForType, function (route) {
        return !route.test || route.test(field);
      });
      if (route) {
        return plugin.require('component.' + route.component).component;
      }
    }

    if (plugin.hasPlugin('component.' + typeName)) {
      return plugin.require('component.' + typeName).component;
    }

    throw new Error('No component for field: ' + JSON.stringify(field.def));
  };

  router.component = function (name) {
    return plugin.require('component.' + name).component;
  };
};
