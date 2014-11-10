// # field-router

/*
Fields and components get glued together via routes. This is similar to URL
routing where a request gets dynamically routed to a handler. This gives a lot
of flexibility in introducing new types and components. You can create a new
type and route it to an existing component, or you can create a new component
and route existing types to it. Or you can create both and route the new type
to the new component. New routes are added via route plugins. A route plugin
simply exports an array like:

```js
[
  'color', // Route this type
  'color-picker-with-alpha', // To this component
  function (field) {
    return typeof field.def.alpha !== 'undefined';
  }
]

Route plugins can be stacked and are sensitive to ordering.
*/

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var routes = {};

  var router = plugin.exports;

  // Get all the route plugins.
  var routePlugins = plugin.requireAll(plugin.config.routes);

  // Register a route.
  router.route = function (typeName, componentName, testFn) {
    if (!routes[typeName]) {
      routes[typeName] = [];
    }
    routes[typeName].push({
      component: componentName,
      test: testFn
    });
  };

  // Register each of the routes provided by the route plugins.
  routePlugins.forEach(function (routePlugin) {

    router.route.apply(router, routePlugin);
  });

  // Determine the best component for a field, based on the routes.
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
};
