'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.default = null;

  plugin.hasFields = true;

  plugin.getValue = function (field) {
    var self = field.findChild(function (child) {
      return child.key() === '.';
    });
    if (self) {
      return self.val();
    } else {
      return null;
    }
  };

  plugin.setValue = function (field, value) {
    var self = field.findChild(function (child) {
      return child.key() === '.';
    });
    if (self) {
      return self.val(value);
    } else {
      throw new Error('No self field inside field wrapper.');
    }
  };

  plugin.visibleField = function (field) {
    if (field.fields) {
      return _.find(field.fields, function (child) {
        return child.key === '.';
      }) || null;
    }
    return null;
  };
};
