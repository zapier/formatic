'use strict';

var _ = require('underscore');

var checkbox = require('./select');

module.exports = _.extend({}, checkbox, {

  compile: function (field) {

    field = checkbox.compile(field);

    if (!_.isArray(field.value)) {
      if (!field.value) {
        field.value = [];
      } else {
        field.value = [field.value];
      }
    }

    if (field.choices.length === 0) {
      field.value = (typeof field.value === 'boolean') ? field.value : false;
      field.type = 'checkbox-boolean';
    }

    return field;
  }
});
