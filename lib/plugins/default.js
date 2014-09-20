'use strict';

module.exports = function (formatic) {

  formatic.plugin('core');

  formatic.filterPluginsInRegistry(function (plugin) {
    return plugin.name.indexOf('views.') === 0;
  }).forEach(function (plugin) {
    formatic.plugin(plugin.name);
  });

  formatic.route('object', 'fieldset');
  formatic.route('string', 'text');
};
