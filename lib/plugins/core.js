'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  formatic.plugin('core.base');

  formatic.filterPluginsInRegistry(function (plugin) {
    return plugin.name.indexOf('components.') === 0;
  }).forEach(function (plugin) {
    formatic.plugin(plugin.name);
  });
};
