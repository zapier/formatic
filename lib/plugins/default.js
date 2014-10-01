'use strict';

module.exports = function (formatic) {

  formatic.plugin('core');
  formatic.plugin('ensure-path');
  formatic.plugin('prop-aliases');
  formatic.plugin('ensure-default');
  formatic.plugin('ensure-fields');

  formatic.filterPluginsInRegistry(function (plugin) {
    return plugin.name.indexOf('views.') === 0;
  }).forEach(function (plugin) {
    formatic.plugin(plugin.name);
  });

  formatic.route('object', 'fieldset');
  formatic.route('string', 'select', function (field) {
    return field.choices ? true : false;
  });
  formatic.route('string', 'text', function (field) {
    return field.maxRows === 1;
  });
  formatic.route('string', 'textarea');
  formatic.route('array', 'list');
};
