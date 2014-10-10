'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.fields = function (field) {

    var fields = field.form.store.fields.filter(function (field) {
      return !field.template;
    });

    return fields.map(function (def) {
      return field.createChild(def);
    });
  };
};
