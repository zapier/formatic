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

  _.each([
    'form',
    'text',
    'textarea',
    'pretty-textarea',
    'password',
    'select',
    'dropdown',
    'checkbox',
    'string',
    'float',
    'integer',
    'number',
    'json',
    'if',
    'get',
    'eq',
    'code'
  ], function (name) {
    formatic.plugin('type-' + name, {type: name});
  });
};
