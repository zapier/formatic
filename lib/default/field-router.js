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

    router.route.apply(router, routePlugin);
  });

  router.componentForField = function (field) {

    var typeName = field.def.type;

    if (routes[typeName]) {
      var routesForType = routes[typeName];
      var route = _.find(routesForType, function (route) {
        return !route.test || route.test(field);
      });
      if (route) {
        return plugin.component(route.component);
      }
    }

    if (plugin.hasComponent(typeName)) {
      return plugin.component(typeName);
    }

    throw new Error('No component for field: ' + JSON.stringify(field.def));
  };

  router.component = function (name) {
    return plugin.component(name);
  };
};
