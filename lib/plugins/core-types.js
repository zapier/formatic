'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.filterPluginsInRegistry(function (plugin) {
    return plugin.name.indexOf('types.') === 0;
  }).forEach(function (plugin) {
    formatic.plugin(plugin.name);
  });
};
