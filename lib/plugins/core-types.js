'use strict';

var _ = require('underscore');

var Formatic = require('../formatic');

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

  _.each(Formatic.plugins.types, function (type, key) {
    formatic.plugin(type, {
      type: key
    });
  });
};
