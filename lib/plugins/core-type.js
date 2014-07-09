'use strict';

var _ = require('underscore');

var utils = require('../utils');

module.exports = function (formatic) {

  var fixType = function (field) {
    var typeMap = formatic.options.typeMap;
    if (!typeMap) {
      return;
    }
    if (field.type && field.type in typeMap) {
      field.type = typeMap[field.type];
    }
  };

  var toValue = function (field) {
    fixType(field);

    if (field.fields && field.fields.length > 0) {
      field.value = field.fields[0];
      if (field.value && field.value.value) {
        field.value = field.value.value;
      }
      field.fields = undefined;
    } else {
      if (typeof field.value === 'undefined') {
        field.value = field.value || null;
      }
    }
  };

  var toFields = function (field) {
    if (typeof field.value !== 'undefined') {
      field.value = undefined;
    }
    field.fields = field.fields || [];
  };

  formatic.hook('type', function (name, type) {

    if (typeof type === 'function') {
      type = type(formatic, name);
    }

    var compile = type.compile;
    var evalField = type.eval;
    var hasFields = type.hasFields || false;

    if (compile) {
      formatic.hook('compileField_' + name, compile);
    }

    if (evalField) {
      formatic.hook('evalField_' + name, evalField);
    }

    if (hasFields) {
      formatic.hook('initField_' + name, toFields);
    } else {
      formatic.hook('initField_' + name, toValue);
    }
  });

  formatic.form.replaceHook('compileField', function (field) {

    if (_.isArray(field)) {
      return _.map(field, function (field) {
        return this.compileField(field);
      }.bind(this));
    }

    field = _.extend({}, field);

    var initHook = 'initField_' + field.type;

    if (formatic.hasHook(initHook)) {
      formatic[initHook](field);
    } else {
      toValue(field);
    }

    var compileHook = 'compileField_' + field.type;

    if (formatic.hasHook(compileHook)) {
      return formatic[compileHook](field, this.compileField.bind(this));
    } else {

      var children = field.fields;

      if (children) {
        field.fields = [];

        _.each(children, function (child) {
          field.fields.push(this.compileField(child));
        }.bind(this));
      }

      return field;
    }

  });

  var runField = function (data, field) {

    if (_.isArray(field)) {
      return _.map(field, function (field) {
        return this.runField(field, data);
      }.bind(this));
    }

    return this.runField(field, data);
  };

  formatic.form.replaceHook('evalField', function (field, data) {

    var evalHook = 'evalField_' + field.type;

    if (formatic.hasHook(evalHook)) {

      field = formatic[evalHook](field, data, runField.bind(this, data));
      return field;
    } else {

      var children = field.fields;

      if (children) {
        field.fields = [];

        _.each(children, function (child) {
          field.fields.push(this.runField(child, data));
        }.bind(this));
      }

      return field;
    }
  });
};
