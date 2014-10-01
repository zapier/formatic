'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  var types = {};

  // Auto register types.
  formatic.onPlugin(function (plugin) {

    if (plugin.name.indexOf('types.') === 0) {
      var type = plugin.name.substring('types.'.length);
      types[type] = plugin;
    }
  });

  formatic.type = function (name, methods) {

    if (typeof methods === 'undefined') {
      return types[name];
    }

    // Create a type plugin to be picked up.
    formatic.plugin(function (formatic, plugin) {
      _.extend(plugin, methods);
    }, {name: 'types.' + name});
  };
};
