'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var typeCoerce = {
    unicode: function (def) {
      def.type = 'string';
      def.maxRows = 1;
    },
    text: 'string',
    select: function (def) {
      def.choices = def.choices || [];
    },
    bool: 'boolean'
  };

  typeCoerce.str = typeCoerce.unicode;


  plugin.exports.compile = function (def) {
    var coerceType = typeCoerce[def.type];
    if (coerceType) {
      if (_.isString(coerceType)) {
        def.type = typeCoerce;
      } else if (_.isFunction(coerceType)) {
        def = coerceType(def);
      }
    }
  };
};
