'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.default = false;

  plugin.compile = function (def) {
    if (!def.choices) {
      def.choices = [
        {value: 'true', label: 'Yes'},
        {value: 'false', label: 'No'}
      ];
    }
  };
};
