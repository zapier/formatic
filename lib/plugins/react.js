'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  formatic.plugin('core');
  formatic.plugin('terse');
  formatic.plugin('read-only');
  formatic.plugin('required');
  formatic.plugin('react-viewer');

  _.each([
    'form',
    'field',
    'text',
    'textarea',
    'pretty-textarea',
    'password',
    'select',
    'dropdown',
    'checkbox',
    'boolean-checkbox',
    'string',
    'float',
    'integer',
    'number',
    'json',
    'code'
  ], function (name) {
    formatic.plugin('view-' + name, {type: name});
  });
};
