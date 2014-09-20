'use strict';

module.exports = function (formatic, plugin) {

  plugin.default = null;

  plugin.getValue = function (field) {
    return null;
  };

  plugin.setValue = function (field, value) {
    if (typeof value !== null && typeof value !== 'undefined') {
      throw new Error('You can only set the value of a null field to null.');
    }
  };
};
