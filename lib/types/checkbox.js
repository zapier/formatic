'use strict';

var _ = require('underscore');

var checkbox = require('./select');

module.exports = _.extend({}, checkbox, {

  compile: function (field) {

    if (field.isWrapped) {
      return field;
    }

    field = checkbox.compile(field);

    if (field.type === 'field') {
      field = field.fields[0];
    }

    if (!_.isArray(field.value)) {
      if (!field.value) {
        field.value = [];
      } else {
        field.value = [field.value];
      }
    }

    if (field.choices.length === 0) {
      field.value = (typeof field.value === 'boolean') ? field.value : false;
      field.type = 'boolean-checkbox';
    }

    return {
      type: 'field',
      fields: [field],
      isWrapped: true
    };
  }
});
