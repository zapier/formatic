'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.form.wrap('compile', function (next, field) {

    if (typeof field === 'undefined') {
      field = {
        type: 'formatic',
        fields: []
      };
    } else if (_.isArray(field)) {
      field = {
        type: 'formatic',
        fields: field
      };
    } else if (field.type !== 'formatic') {
      field = {
        type: 'formatic',
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
