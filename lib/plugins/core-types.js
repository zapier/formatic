'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.form.wrap('compile', function (next, field) {

    if (typeof field === 'undefined') {
      field = {
        type: 'form',
        fields: []
      };
    } else if (_.isArray(field)) {
      field = {
        type: 'form',
        fields: field
      };
    } else if (field.type !== 'form') {
      field = {
        type: 'form',
        fields: [field]
      };
    }

    return next(field);
  });

  formatic.filterPluginsInRegistry(function (plugin) {
    return plugin.name.indexOf('type-') === 0;
  }).forEach(function (plugin) {
    formatic.plugin(plugin.name);
  });
};
