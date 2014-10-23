'use strict';

module.exports = function (plugin) {

  plugin.exports.routes = [
    ['object', 'fieldset'],
    ['string', 'select', function (field) {
      return field.def.choices ? true : false;
    }],
    ['string', 'text', function (field) {
      return field.def.maxRows === 1;
    }],
    ['string', 'textarea'],
    ['array', 'checkbox-list', function (field) {
      return field.def.choices ? true : false;
    }],
    ['array', 'list'],
    ['boolean', 'select']
  ];

};
