'use strict';

module.exports = function (formatic) {

  formatic.plugin('core');
  formatic.plugin('terse');
  formatic.plugin('read-only');
  formatic.plugin('required');
  formatic.plugin('default');
  formatic.plugin('react-viewer');

  formatic.filterPluginsInRegistry(function (plugin) {
    return plugin.name.indexOf('view-') === 0;
  }).forEach(function (plugin) {
    formatic.plugin(plugin.name);
  });
};
