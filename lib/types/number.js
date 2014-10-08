'use strict';

module.exports = function (formatic, plugin) {

  plugin.default = 0;

  plugin.getValue = function (field) {

    try {
      return parseInt(field.get('value'));
    } catch (e) {
      return 0;
    }
  };
};
