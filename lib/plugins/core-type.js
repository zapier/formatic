'use strict';

var _ = require('underscore');

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

  formatic.method('type', function (name, type) {

    if (typeof type === 'function') {
      type = type(formatic);
    }

    var compile = type.compile;
    var evalField = type.eval;
    var hasFields = type.hasFields || false;
    var format = type.format;
    var parse = type.parse;

    if (compile) {
      formatic.method('compileField_' + name, compile);
    }

    if (evalField) {
      formatic.method('evalField_' + name, evalField);
    }

    if (hasFields) {
      formatic.method('initField_' + name, toFields);
    } else {
      formatic.method('initField_' + name, toValue);
    }

    if (format) {
      formatic.method('format_' + name, format);
    }

    if (parse) {
      formatic.method('parse_' + name, parse);
    }
  });

  formatic.form.replaceMethod('compileField', function (field) {

    if (_.isArray(field)) {
      return _.map(field, function (field) {
        return this.compileField(field);
      }.bind(this));
    }

    field = _.extend({}, field);

    var initHook = 'initField_' + field.type;

    if (formatic.hasMethod(initHook)) {
      formatic[initHook](field);
    } else {
      toValue(field);
    }

    var compileHook = 'compileField_' + field.type;

    if (formatic.hasMethod(compileHook)) {
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

  formatic.form.replaceMethod('evalField', function (field, data) {

    var evalHook = 'evalField_' + field.type;

    if (formatic.hasMethod(evalHook)) {

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
