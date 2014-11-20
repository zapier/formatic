// # field-routes

/*
Default routes. Each route is part of its own plugin, but all are kept together
here as part of a plugin bundle.
*/

'use strict';

var _ = require('underscore');

var routes = {

  'object.static': [
    'object',
    'fieldset',
    function (field) {
      return field.def.staticKeys;
    }
  ],

  'object.default': [
    'object',
    'object'
  ],

  'string.choices': [
    'string',
    'select',
    function (field) {
      return field.def.choices ? true : false;
    }
  ],

  'string.tags': [
    'string',
    'pretty-textarea',
    function (field) {
      return field.def.replaceChoices;
    }
  ],

  'string.single-line': [
    'string',
    'text',
    function (field) {
      return field.def.maxRows === 1;
    }
  ],

  'string.default': [
    'string',
    'textarea'
  ],

  'array.choices': [
    'array',
    'checkbox-list',
    function (field) {
      return field.def.choices ? true : false;
    }
  ],

  'array.default': [
    'array',
    'list'
  ],

  'boolean.default': [
    'boolean',
    'select'
  ],

  'number.default': [
    'number',
    'text'
  ]

};

// Build a plugin bundle.
_.each(routes, function (route, name) {
  module.exports['field-route.' + name] = function (plugin) {
    plugin.exports = route;
  };
});
